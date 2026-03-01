/**
 * Input Component Examples
 * 
 * Demonstrates various use cases of the Input component
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../Input';

export function InputExample() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [search, setSearch] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !text.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* Basic Text Input */}
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          helperText="Enter your first and last name"
        />
      </View>

      <View style={styles.section}>
        {/* Email Input with Validation */}
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChangeText={validateEmail}
          placeholder="you@example.com"
          error={emailError}
        />
      </View>

      <View style={styles.section}>
        {/* Password Input with Toggle */}
        <Input
          type="password"
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          showPasswordToggle={true}
          helperText="Must be at least 8 characters"
        />
      </View>

      <View style={styles.section}>
        {/* Numeric Input */}
        <Input
          type="numeric"
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          helperText="Enter amount in NGN"
        />
      </View>

      <View style={styles.section}>
        {/* Disabled Input */}
        <Input
          label="Account Number"
          value="1234567890"
          onChangeText={() => {}}
          disabled={true}
        />
      </View>

      <View style={styles.section}>
        {/* Read-only Input */}
        <Input
          label="User ID"
          value="USR-2024-001"
          onChangeText={() => {}}
          readOnly={true}
          helperText="This field cannot be edited"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
});
