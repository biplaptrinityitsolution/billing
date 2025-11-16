// src/screens/auth/LoginScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  User,
  Phone,
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext.js';
import { forgotPasswordApi, registerOwnerApi } from '../../api/auth';
import { AlertContext } from '../../context/AuthContext';

// Phone number regex pattern for validation (10 digits)
const PHONE_REGEX = /^\d{10}$/;

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [currentFlow, setCurrentFlow] = useState('login'); // 'login', 'signUp', or 'forgotPassword'
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  const { login } = useContext(AuthContext);
  const alertCtx = useContext(AlertContext);

  useEffect(() => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setLocalIsLoading(false);
    setShowPassword(false);
    setName('');
  }, [currentFlow]);

  const isPhone = input => PHONE_REGEX.test(input);

  const handleAuthAction = async () => {
    Keyboard.dismiss();

    if (currentFlow === 'signUp') {
      if (!name) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Missing Information',
            message: 'Please enter your name.',
            type: 'warning',
          });
        return;
      }

      if (!phone) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Missing Information',
            message: 'Please enter your phone number.',
            type: 'warning',
          });
        return;
      }

      if (!isPhone(phone)) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Invalid Phone Number',
            message: 'Please enter a valid 10-digit phone number.',
            type: 'error',
          });
        return;
      }

      if (!password) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Missing Information',
            message: 'Please enter your password.',
            type: 'warning',
          });
        return;
      }

      if (!confirmPassword) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Missing Information',
            message: 'Please enter confirm password.',
            type: 'warning',
          });
        return;
      }

      if (password !== confirmPassword) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Password Mismatch',
            message: 'Password and confirm password do not match.',
            type: 'error',
          });
        return;
      }
    } else {
      // login
      if(!phone || !password) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Input Required',
            message: 'Please enter both phone number and password.',
            type: 'warning',
          });
        return;
      }
      if (!isPhone(phone)) {
        alertCtx &&
          alertCtx.showAlert &&
          alertCtx.showAlert({
            title: 'Invalid Phone Number',
            message: 'Please enter a valid 10-digit phone number.',
            type: 'error',
          });
        return;
      }
    }
    setLocalIsLoading(true);
    try {
      if (currentFlow === 'login'){
        const loginResult = await login(phone, password);
        console.log('Login Result:', loginResult);
        if (!loginResult.success) {
          alertCtx &&
            alertCtx.showAlert &&
            alertCtx.showAlert({
              title: 'Login Failed',
              message: loginResult.error,
              type: 'error',
            });
        }
      } else {
        // Sign Up API call
        try {
          const payload = {
            name,
            phone,
            password,
          };
          
          const res = await registerOwnerApi(payload);
          if (res?.status === 0) {
            alertCtx &&
              alertCtx.showAlert &&
              alertCtx.showAlert({
                title: 'Registration Successful',
                message: 'Account created successfully.',
                type: 'success',
              });
            setCurrentFlow('login');
          } else {
            alertCtx &&
              alertCtx.showAlert &&
              alertCtx.showAlert({
                title: 'Something Went Wrong',
                message: res?.message || 'Something went wrong during registration. Please try again.',
                type: 'error',
              });
          }
        } catch (e) {
          alertCtx &&
            alertCtx.showAlert &&
            alertCtx.showAlert({
              title: 'Registration Failed',
              message:
                e.response?.data?.message ||
                'Unable to register. Please try again.',
              type: 'error',
            });
        }
      }
    } catch (error) {
      console.error('Auth action error:', error);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    if (!phone) {
      Alert.alert(
        'Phone Required',
        'Please enter your phone number to receive a password reset link.',
      );
      return;
    }
    if (!isPhone(phone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number.',
      );
      return;
    }

    setLocalIsLoading(true);
    try {
      const response = await forgotPasswordApi(phone);
      Alert.alert(
        'Password Reset',
        response.data.message ||
          'If this phone number is registered you will receive reset instructions.',
      );
      setCurrentFlow('login');
    } catch (error) {
      Alert.alert(
        'Reset Failed',
        error.response?.data?.message ||
          'Could not send reset link. Please try again.',
      );
      console.error('Forgot password failed:', error);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const renderAuthForm = () => (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      delay={400}
      style={styles.formContainer}
    >
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {currentFlow === 'login' ? <Text>Welcome Back</Text> : <Text>Create Account</Text>}
        </Text>
        <Text style={styles.formSubtitle}>
          {currentFlow === 'login'
            ? <Text>Enter your credentials to continue</Text>
            : <Text>Sign up to get started</Text>}
        </Text>

        {/* Name Input - Only for Sign Up */}
        {currentFlow === 'signUp' && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color="#7F8C8D" style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.inputField}
                autoCapitalize="words"
                placeholderTextColor="#95A5A6"
                editable={!localIsLoading}
              />
            </View>
          </View>
        )}

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#7F8C8D" style={styles.inputIcon} />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={text => {
                // Only allow up to 10 digits and no letters
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 10);
                setPhone(filtered);
              }}
              style={styles.inputField}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
              placeholderTextColor="#95A5A6"
              editable={!localIsLoading}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#7F8C8D" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.inputField}
              secureTextEntry={!showPassword}
              placeholderTextColor="#95A5A6"
              editable={!localIsLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={localIsLoading}
            >
              {showPassword ? (
                <EyeOff size={20} color="#7F8C8D" />
              ) : (
                <Eye size={20} color="#7F8C8D" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password - Only for Sign Up */}
        {currentFlow === 'signUp' && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#7F8C8D" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.inputField}
                secureTextEntry={!showPassword}
                placeholderTextColor="#95A5A6"
                editable={!localIsLoading}
              />
            </View>
          </View>
        )}

        {currentFlow === 'login' && (
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => setCurrentFlow('forgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            localIsLoading && styles.actionButtonDisabled,
          ]}
          onPress={handleAuthAction}
          disabled={localIsLoading}
          activeOpacity={0.8}
        >
          {localIsLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>
                {currentFlow === 'login' ? <Text>Login</Text> : <Text>Sign Up</Text>}
              </Text>
              <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
            </View>
          )}
        </TouchableOpacity>

        {/* Toggle Login/SignUp */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {currentFlow === 'login'
              ? <Text>{"Don't have an account?"}</Text>
              : <Text>Already have an account?</Text>}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentFlow(currentFlow === 'login' ? 'signUp' : 'login')
            }
          >
            <Text style={styles.toggleLink}>
              {currentFlow === 'login' ? <Text>Sign Up</Text> : <Text>Login</Text>}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  const renderForgotPasswordForm = () => (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      delay={400}
      style={styles.formContainer}
    >
      <View style={styles.formCard}>
        <Text style={styles.formTitle}><Text>Reset Password</Text></Text>
        <Text style={styles.formSubtitle}>
          <Text>Enter your phone number to receive a password reset link</Text>
        </Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#7F8C8D" style={styles.inputIcon} />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={text => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 10);
                setPhone(filtered);
              }}
              style={styles.inputField}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
              placeholderTextColor="#95A5A6"
              editable={!localIsLoading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            localIsLoading && styles.actionButtonDisabled,
          ]}
          onPress={handleForgotPassword}
          disabled={localIsLoading}
          activeOpacity={0.8}
        >
          {localIsLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}><Text>Send Reset Link</Text></Text>
              <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={() => setCurrentFlow('login')}
        >
          <Text style={styles.backToLoginText}><Text>Back to Login</Text></Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <Animatable.View
              animation="fadeInDown"
              duration={1000}
              style={styles.logoContainer}
            >
              <View style={styles.logoCircle}>
                <Wallet size={48} color="#2C3E50" strokeWidth={2} />
              </View>
              <Text style={styles.title}><Text>Trinity Billing</Text></Text>
              <Text style={styles.subtitle}><Text>Easy Online Payment</Text></Text>
            </Animatable.View>

            {/* Form Section */}
            {currentFlow === 'forgotPassword'
              ? renderForgotPasswordForm()
              : renderAuthForm()}

            {/* Bottom Illustration */}
            <Animatable.View
              animation="fadeIn"
              duration={1000}
              delay={800}
              style={styles.bottomIllustration}
            >
              <Text style={styles.illustrationEmoji}><Text>💳</Text></Text>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7FCEA',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  innerContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 28,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2C3E50',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2C3E50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#95A5A6',
    shadowColor: '#95A5A6',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  backToLoginButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backToLoginText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: '#7F8C8D',
    fontSize: 14,
    marginRight: 6,
  },
  toggleLink: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomIllustration: {
    alignItems: 'center',
    marginTop: 30,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
});
