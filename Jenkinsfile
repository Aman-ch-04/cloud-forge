pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        // Docker Registry Configuration
        REGISTRY = 'docker.io'
        REGISTRY_CREDENTIALS = 'docker-credentials'
        IMAGE_NAME_FRONTEND = 'cropx-frontend'
        IMAGE_NAME_BACKEND = 'cropx-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Deployment Configuration
        DEPLOYMENT_SERVER = 'your-ec2-ip'
        DEPLOYMENT_USER = 'ec2-user'
        DEPLOYMENT_PATH = '/opt/cropx'
    }

    stages {
        // ============================================
        // STAGE 1: Checkout
        // ============================================
        stage('Checkout') {
            steps {
                script {
                    echo "📦 Checking out source code from repository..."
                    checkout scm
                }
            }
        }

        // ============================================
        // STAGE 2: Build & Test
        // ============================================
        stage('Build & Test') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        script {
                            echo "🏗️ Building Frontend..."
                            sh '''
                                cd frontend
                                npm ci
                                npm run build
                                npm run lint || true
                            '''
                        }
                    }
                }

                stage('Backend Test') {
                    steps {
                        script {
                            echo "🧪 Testing Backend..."
                            sh '''
                                cd backend
                                pip install -r ../requirements.txt
                                # Add your test commands here
                                # python -m pytest
                            '''
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE 3: Build Docker Images
        // ============================================
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            echo "🐳 Building Frontend Docker Image..."
                            sh '''
                                docker build -t ${REGISTRY}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG} \
                                            -t ${REGISTRY}/${IMAGE_NAME_FRONTEND}:latest \
                                            -f Dockerfile.frontend .
                                docker images | grep ${IMAGE_NAME_FRONTEND}
                            '''
                        }
                    }
                }

                stage('Build Backend Image') {
                    steps {
                        script {
                            echo "🐳 Building Backend Docker Image..."
                            sh '''
                                docker build -t ${REGISTRY}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG} \
                                            -t ${REGISTRY}/${IMAGE_NAME_BACKEND}:latest \
                                            -f Dockerfile.backend .
                                docker images | grep ${IMAGE_NAME_BACKEND}
                            '''
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE 4: Push to Registry
        // ============================================
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "📤 Pushing images to Docker Registry..."
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}",
                                                     usernameVariable: 'DOCKER_USER',
                                                     passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push ${REGISTRY}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}
                            docker push ${REGISTRY}/${IMAGE_NAME_FRONTEND}:latest
                            docker push ${REGISTRY}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG}
                            docker push ${REGISTRY}/${IMAGE_NAME_BACKEND}:latest
                            docker logout
                        '''
                    }
                }
            }
        }

        // ============================================
        // STAGE 5: Deploy to EC2
        // ============================================
        stage('Deploy to EC2') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🚀 Deploying to EC2..."
                    sshagent(['ec2-key-credentials']) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no ${DEPLOYMENT_USER}@${DEPLOYMENT_SERVER} "
                                # Create deployment directory if not exists
                                mkdir -p ${DEPLOYMENT_PATH}

                                # Pull latest images
                                docker pull ${REGISTRY}/${IMAGE_NAME_FRONTEND}:latest
                                docker pull ${REGISTRY}/${IMAGE_NAME_BACKEND}:latest

                                # Stop running containers
                                cd ${DEPLOYMENT_PATH}
                                docker-compose down || true

                                # Start new containers
                                docker-compose up -d

                                # Check deployment status
                                sleep 5
                                docker-compose ps
                            "
                        '''
                    }
                }
            }
        }

        // ============================================
        // STAGE 6: Health Check
        // ============================================
        stage('Health Check') {
            steps {
                script {
                    echo "✅ Performing health checks..."
                    retry(3) {
                        sh '''
                            # Check frontend
                            curl -f http://${DEPLOYMENT_SERVER} || exit 1
                            echo "Frontend is up!"

                            # Check backend
                            curl -f http://${DEPLOYMENT_SERVER}:5000/ || exit 1
                            echo "Backend is up!"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                echo "✨ Deployment successful!"
                // Add Slack/Email notification here
            }
        }

        failure {
            script {
                echo "❌ Deployment failed!"
                // Add Slack/Email notification here
            }
        }

        always {
            script {
                echo "🧹 Cleaning up..."
                // Cleanup temporary files if needed
                sh 'docker system prune -f || true'
            }
        }
    }
}
