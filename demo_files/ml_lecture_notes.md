# Lecture 8: Optimization in Deep Neural Networks

## 1. Stochastic Gradient Descent with Momentum
v_t = beta * v_{t-1} + (1 - beta) * grad(W)
W = W - alpha * v_t

## 2. Adam Optimizer
Combines first moment (momentum) and second raw moment (RMSProp) with bias correction.
Used as default optimizer for Transformer and Vision architectures.