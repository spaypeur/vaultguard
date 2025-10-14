import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to VaultGuard',
    description: 'Enterprise-grade crypto security platform with zero-knowledge compliance and multi-signature protection.',
    icon: '🔐',
  },
  {
    id: '2',
    title: 'Advanced Security',
    description: 'Military-grade encryption, biometric authentication, and real-time threat monitoring.',
    icon: '🛡️',
  },
  {
    id: '3',
    title: 'Compliance Ready',
    description: 'Built-in compliance tools, audit trails, and regulatory reporting for global jurisdictions.',
    icon: '📋',
  },
  {
    id: '4',
    title: 'Multi-Signature Protection',
    description: 'Enhanced security with multi-signature transactions and quantum-resistant cryptography.',
    icon: '🔑',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        navigation.navigate('Login');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
        navigation.navigate('Login');
      }
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.navigate('Login');
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDot = (index: number) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [10, 20, 10],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[styles.dot, { width: dotWidth, opacity }]}
        key={index.toString()}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.slidesContainer}>
        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={32}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={scrollTo}>
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0ea5e9',
    marginHorizontal: 8,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});