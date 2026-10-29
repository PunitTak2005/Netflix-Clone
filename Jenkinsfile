pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'nodejs'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        FRONTEND_IMAGE = 'punittak2005cse/netflix-clone'
        BACKEND_IMAGE = 'punittak2005cse/netflix-backend'
    }

    stages {
        stage('Workspace Cleaning') {
            steps {
                cleanWs()
            }
        }

        stage('Tool Verification') {
            steps {
                sh '''
                    echo "=== Verifying Tool Installations ==="
                    node -v
                    npm -v
                    java -version
                '''
            }
        }

        stage('Git Checkout') {
            steps {
                git branch: 'master', credentialsId: 'git-cred', url: 'https://github.com/PunitTak2005/Netflix-Clone.git'
            }
        }

        stage('Dependency Installation') {
            steps {
                sh '''
                    echo "=== Installing Dependencies ==="
                '''
                dir('backend') {
                    sh 'npm ci --omit=dev'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    withCredentials([
                        string(credentialsId: 'TMDB_API_KEY', variable: 'TMDB_API_KEY')
                    ]) {
                        sh '''
                            echo "Building frontend production assets..."
                            export VITE_APP_API_ENDPOINT_URL="/api/tmdb"
                            export VITE_TMDB_V3_API_KEY="${TMDB_API_KEY}"
                            export VITE_APP_TMDB_V3_API_KEY="${TMDB_API_KEY}"
                            export VITE_TMDB_API_KEY="${TMDB_API_KEY}"
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                    rm -f trivy-fs-report.html
                    trivy fs --format table -o trivy-fs-report.html .
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-fs-report.html', allowEmptyArchive: true
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        \${SCANNER_HOME}/bin/sonar-scanner \\
                        -Dsonar.projectName=DevOpsProject \\
                        -Dsonar.projectKey=DevOpsProject \\
                        -Dsonar.sources=. \\
                        -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/target/**"
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }

        stage('Docker Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'TMDB_API_KEY', variable: 'TMDB_API_KEY')
                ]) {
                    sh """
                        docker build -t \${FRONTEND_IMAGE}:\${BUILD_ID} -t \${FRONTEND_IMAGE}:latest --build-arg TMDB_V3_API_KEY=\${TMDB_API_KEY} .
                        docker build -t \${BACKEND_IMAGE}:\${BUILD_ID} -t \${BACKEND_IMAGE}:latest ./backend
                    """
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh """
                    rm -f trivy-image-report.html
                    trivy image --format table -o trivy-image-report.html \${FRONTEND_IMAGE}:\${BUILD_ID}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-image-report.html', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Push') {
            steps {
                withDockerRegistry(credentialsId: 'docker-cred') {
                    sh """
                        docker push \${FRONTEND_IMAGE}:\${BUILD_ID}
                        docker push \${FRONTEND_IMAGE}:latest
                        docker push \${BACKEND_IMAGE}:\${BUILD_ID}
                        docker push \${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                withKubeConfig(
                    credentialsId: 'k8-cred',
                    namespace: 'webapps',
                    serverUrl: 'https://172.31.1.86:6443'
                ) {
                    sh '''
                        kubectl apply -f Kubernetes/ --validate=false
                    '''
                }
            }
        }
    }

    post {
        always {
            emailext(
                subject: "Jenkins Build #${BUILD_NUMBER} - ${JOB_NAME}",
                body: """<p>Build Status: ${currentBuild.currentResult}</p>
                         <p>Check the build details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>""",
                to: 'punittak2005@gmail.com',
                replyTo: 'punittak2005@gmail.com',
                mimeType: 'text/html'
            )
        }
    }
}
