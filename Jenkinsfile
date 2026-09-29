pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        // AWS ECR / EKS Configuration
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '535002872767'
        ECR_REGISTRY = '535002872767.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_NAME_FRONTEND = 'cropx-frontend'
        IMAGE_NAME_BACKEND = 'cropx-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EKS_CLUSTER = 'cloudforge-eks'
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
                                python3 -m venv .venv
                                .venv/bin/pip install -r ../requirements.txt
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
                                docker build -t ${ECR_REGISTRY}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG} \
                                            -t ${ECR_REGISTRY}/${IMAGE_NAME_FRONTEND}:latest \
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
                                docker build -t ${ECR_REGISTRY}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG} \
                                            -t ${ECR_REGISTRY}/${IMAGE_NAME_BACKEND}:latest \
                                            -f Dockerfile.backend .
                                docker images | grep ${IMAGE_NAME_BACKEND}
                            '''
                        }
                    }
                }
            }
        }

        // ============================================
        // STAGE 4: Push to AWS ECR
        // ============================================
        stage('Push to ECR') {
            steps {
                script {
                    echo "📤 Logging in to AWS ECR and pushing images..."
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} |                           docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                                
                                                
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME_FRONTEND}:latest
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${IMAGE_NAME_BACKEND}:latest
                    '''
                }
            }
        }

        // ============================================
        // STAGE 5: Deploy to EKS
        // ============================================
        stage('Deploy to EKS') {
            steps {
                script {
                    echo "🚀 Deploying CropX to EKS..."
                    sh '''
                        aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER}

                        kubectl set image deployment/cropx-frontend                           cropx-frontend=${ECR_REGISTRY}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}

                        kubectl set image deployment/cropx-backend                           cropx-backend=${ECR_REGISTRY}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG}

                        kubectl rollout status deployment/cropx-frontend --timeout=180s
                        kubectl rollout status deployment/cropx-backend --timeout=180s

                        kubectl get pods -o wide
                    '''
                }
            }
        }

        // ============================================
        // STAGE 6: Health Check
        // ============================================
        stage('Health Check') {
            steps {
                script {
                    echo "✅ Performing EKS health checks..."
                    sh '''
                        kubectl get deployments
                        kubectl get pods
                        kubectl get svc cropx-frontend-svc

                        FRONTEND_URL=$(kubectl get svc cropx-frontend-svc                           -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

                        echo "Frontend LoadBalancer: ${FRONTEND_URL}"

                        test -n "${FRONTEND_URL}"
                        curl -f --max-time 20 http://${FRONTEND_URL}/health.html

                        echo "Frontend is healthy!"
                    '''
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
