import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const biometricScale = useState(new Animated.Value(1))[0];

  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBiometricAuth = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(biometricScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(biometricScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access VaultGuard',
      });

      if (result.success) {
        // Success animation before navigation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('MainTabs');
        });
      }
    } else {
      Alert.alert('Biometric authentication not available');
    }
  };

  const handleLogin = async () => {
    try {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Validate input
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      // Show loading state
      const loadingAlert = Alert.alert('Signing In', 'Please wait...', [], { cancelable: false });

      // Make API call to backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication tokens
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        // Success animation before navigation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('MainApp');
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>VaultGuard</Text>
        <Text style={styles.subtitle}>Enterprise Crypto Security</Text>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: biometricScale }] }}>
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
            <Text style={styles.biometricText}>Use Biometric Authentication</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => {
            // Navigate to register with exit animation
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: 50,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              navigation.navigate('Register');
            });
          }}
        >
          <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    width: '100%',
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    marginTop: 16,
  },
  biometricText: {
    color: '#0ea5e9',
    fontSize: 14,
  },
  registerButton: {
    marginTop: 24,
  },
  registerText: {
    color: '#0ea5e9',
    fontSize: 14,
  },
});
