// src/screens/SplashScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Wallet, TrendingUp, Zap } from 'lucide-react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Container with Animation */}
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={200}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <Animatable.View
              animation="zoomIn"
              duration={800}
              delay={600}
              easing="ease-out"
            >
              <Wallet size={64} color="#2C3E50" strokeWidth={2} />
            </Animatable.View>
          </View>
        </Animatable.View>

        {/* App Name Animation */}
        <Animatable.Text
          animation="fadeInUp"
          duration={800}
          delay={1000}
          style={styles.appName}
        >
          Trinity Billing
        </Animatable.Text>

        {/* Tagline Animation */}
        <Animatable.Text
          animation="fadeInUp"
          duration={800}
          delay={1200}
          style={styles.tagline}
        >
          Easy Online Payment
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          duration={800}
          delay={1300}
          style={styles.subtitle}
        >
          Make your payment experience more better today. No additional admin fee
        </Animatable.Text>

        {/* Feature Icons */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={1500}
          style={styles.featuresContainer}
        >
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Zap size={24} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <Text style={styles.featureText}>Fast</Text>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <TrendingUp size={24} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <Text style={styles.featureText}>Secure</Text>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Wallet size={24} color="#2C3E50" strokeWidth={2.5} />
            </View>
            <Text style={styles.featureText}>Easy</Text>
          </View>
        </Animatable.View>

        {/* Loading Indicator */}
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={1800}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingBar}>
            <Animatable.View
              animation={{
                0: { width: '0%' },
                1: { width: '100%' },
              }}
              duration={2000}
              delay={2000}
              easing="ease-in-out"
              style={styles.loadingProgress}
            />
          </View>
        </Animatable.View>
      </View>

      {/* Bottom Illustration */}
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        delay={1600}
        style={styles.illustrationContainer}
      >
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationEmoji}>💳</Text>
        </View>
      </Animatable.View>

      {/* Bottom Text */}
      <Animatable.Text
        animation="fadeIn"
        duration={800}
        delay={2200}
        style={styles.bottomText}
      >
        Powered by Trinity Solutions
      </Animatable.Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA', // Greenish background
   
    
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 22,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  featureDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  loadingContainer: {
    width: 200,
    marginBottom: 60,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(44, 62, 80, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#2C3E50',
    borderRadius: 2,
  },
  illustrationContainer: {
    position: 'absolute',
    bottom: 100,
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  illustrationEmoji: {
    fontSize: 40,
  },
  bottomText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
});