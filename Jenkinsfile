pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'nodejs'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = 'punittak2005cse/netflix-clone'
    }

    stages {
        stage('Workspace Cleaning') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout from Git') {
            steps {
                git branch: 'master', credentialsId: 'git-cred', url: 'https://github.com/PunitTak2005/Netflix-Clone.git'
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    echo "=== Verifying Tool Installations ==="
                    node -v
                    npm -v
                    java -version
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        \${SCANNER_HOME}/bin/sonar-scanner \\
                        -Dsonar.projectName=DevOpsProject \\
                        -Dsonar.projectKey=DevOpsProject \\
                        -Dsonar.sources=frontend,backend \\
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

        stage('Install Dependencies') {
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

        stage('TRIVY FS SCAN') {
            steps {
                sh '''
                    rm -f trivy-fs-report.html
                    trivy fs --scanners vuln,secret,misconfig --format table -o trivy-fs-report.html .
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-fs-report.html', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                sh """
                    docker build --no-cache -t \${DOCKER_IMAGE}:\${BUILD_ID} -t \${DOCKER_IMAGE}:latest .
                """
            }
        }

        stage('TRIVY Image Scan') {
            steps {
                sh """
                    rm -f trivy-image-report.html
                    trivy image --scanners vuln,secret --format table -o trivy-image-report.html \${DOCKER_IMAGE}:\${BUILD_ID}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-image-report.html', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Registry Login & Push') {
            steps {
                withDockerRegistry(credentialsId: 'docker-cred') {
                    sh """
                        docker push \${DOCKER_IMAGE}:\${BUILD_ID}
                        docker push \${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig(
                    credentialsId: 'k8-cred',
                    namespace: 'webapps',
                    serverUrl: 'https://172.31.1.86:6443'
                ) {
                    withCredentials([
                        string(credentialsId: 'tmdb-api-key', variable: 'TMDB_KEY')
                    ]) {
                        sh '''
                            kubectl create secret generic tmdb-secret \
                                --from-literal=TMDB_API_KEY="${TMDB_KEY}" \
                                --from-literal=api-key="${TMDB_KEY}" \
                                --namespace=webapps \
                                --dry-run=client -o yaml | kubectl apply -f -
                            kubectl apply -f Kubernetes/deployment.yml --validate=false
                            kubectl apply -f Kubernetes/service.yml --validate=false
                            kubectl rollout restart deployment/netflix-app -n webapps
                            kubectl rollout status deployment/netflix-app -n webapps --timeout=120s
                        '''
                    }
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
