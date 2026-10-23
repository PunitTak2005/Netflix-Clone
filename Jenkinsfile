pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'nodejs'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_HUB_NAMESPACE = 'punittak2005cse'
        ASSIGNMENT_NAMESPACE = 'punitdevops.shop'
        BACKEND_IMAGE = "${DOCKER_HUB_NAMESPACE}/mern-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_NAMESPACE}/mern-frontend"
        BACKEND_ASSIGNMENT_IMAGE = "${ASSIGNMENT_NAMESPACE}/mern-backend"
        FRONTEND_ASSIGNMENT_IMAGE = "${ASSIGNMENT_NAMESPACE}/mern-frontend"
    }

    stages {
        stage('Workspace Cleaning') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout from Git') {
            steps {
                git branch: 'master', url: 'https://github.com/sunilkumar0633/Netflix-Clone.git'
            }
        }

        stage('Install Dependencies & Build') {
            steps {
                dir('backend') {
                    sh 'npm ci --omit=dev'
                }
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage("Sonarqube Analysis") {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=DevOpsProject \
                        -Dsonar.projectKey=DevOpsProject \
                        -Dsonar.java.binaries=.
                    '''
                }
            }
        }

        stage("Quality Gate") {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }

        stage('OWASP DP SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'owasp-dp-check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        
        stage('TRIVY FS SCAN') {
            steps {
               sh "trivy fs --format table -o trivy-fs-report.html ."
            }
        }

        stage("Docker Image Build") {
            steps {
                sh """
                    docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest -t ${BACKEND_ASSIGNMENT_IMAGE}:latest ./backend
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_ASSIGNMENT_IMAGE}:latest ./frontend
                """
            }
        }

        stage("Trivy Image Scan") {
            steps {
                sh """
                    trivy image --format table -o trivy-backend-image-report.txt ${BACKEND_IMAGE}:latest
                    trivy image --severity HIGH,CRITICAL --exit-code 1 ${BACKEND_IMAGE}:latest

                    trivy image --format table -o trivy-frontend-image-report.txt ${FRONTEND_IMAGE}:latest
                    trivy image --severity HIGH,CRITICAL --exit-code 1 ${FRONTEND_IMAGE}:latest
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-*-image-report.txt', allowEmptyArchive: true
                }
            }
        }

        stage("Docker Registry Login & Push") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh """
                        echo "\$DOCKER_PASSWORD" | docker login -u "\$DOCKER_USERNAME" --password-stdin
                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    dir('Kubernetes') {
                        withKubeConfig(credentialsId: 'k8s-cred', namespace: 'webapps', serverUrl: 'https://172.31.25.156:6443') {
                            sh 'kubectl apply -f deployment.yml'
                            sh 'kubectl apply -f service.yml'
                        }
                    }
                }
            }
        }
    }

    // Post-build Email Notification
    post {
        always {
            emailext(
                subject: "Jenkins Build #${BUILD_NUMBER} - ${JOB_NAME}",
                body: """<p>Build Status: ${currentBuild.currentResult}</p>
                         <p>Check the build details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>""",
                to: 'sunielmahla@gmail.com',
                replyTo: 'sunielmahla@gmail.com',
                mimeType: 'text/html'
            )
        }
    }
}
