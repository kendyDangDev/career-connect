import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAlert } from '@/contexts/AlertContext';

const DocumentPickerTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const alert = useAlert();

  const testDocumentPicker = async () => {
    try {
      console.log('Testing DocumentPicker...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      console.log('Raw result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset);
        console.log('Selected asset:', JSON.stringify(asset, null, 2));
        
        alert.success(
          'File Selected',
          `Name: ${asset.name}\nSize: ${asset.size}\nType: ${asset.mimeType}\nURI: ${asset.uri}`
        );
      } else {
        console.log('Selection cancelled or no assets');
        alert.info('Cancelled', 'No file selected');
      }
    } catch (error) {
      console.error('DocumentPicker error:', error);
      alert.error('Error', `Failed to pick document: ${error}`);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    console.log('File selection cleared');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Picker Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testDocumentPicker}>
        <Text style={styles.buttonText}>Pick Document</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
        <Text style={styles.clearButtonText}>Clear Selection</Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.label}>Selected File:</Text>
          <Text style={styles.info}>Name: {selectedFile.name}</Text>
          <Text style={styles.info}>Size: {selectedFile.size} bytes</Text>
          <Text style={styles.info}>Type: {selectedFile.mimeType}</Text>
          <Text style={styles.info} numberOfLines={2}>URI: {selectedFile.uri}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.debugButton} 
        onPress={() => {
          console.log('Current selectedFile state:', selectedFile);
          alert.info(
            'Debug State',
            selectedFile ? `File: ${selectedFile.name}` : 'No file selected'
          );
        }}
      >
        <Text style={styles.debugButtonText}>Check State</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#95A5A6',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  debugButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495E',
  },
});

export default DocumentPickerTest;
