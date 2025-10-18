import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';

// Web imports
let WebViewForWeb: any = null;
if (Platform.OS === 'web') {
  // For web, we'll use an iframe
  WebViewForWeb = React.forwardRef<HTMLIFrameElement, any>((props, ref) => {
    const { source, style, onLoadProgress, onError, ...restProps } = props;
    
    const handleLoad = () => {
      if (onLoadProgress) {
        onLoadProgress({ nativeEvent: { progress: 1 } });
      }
    };

    const handleError = () => {
      if (onError) {
        onError({ nativeEvent: { description: 'Failed to load content' } });
      }
    };

    return (
      <iframe
        ref={ref}
        src={source?.uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...restProps}
      />
    );
  });
}

// Mobile imports
let WebViewForMobile: any = null;
if (Platform.OS !== 'web') {
  try {
    const { WebView } = require('react-native-webview');
    WebViewForMobile = WebView;
  } catch (error) {
    console.warn('react-native-webview not available');
  }
}

export interface CrossPlatformWebViewProps {
  source: { uri: string };
  style?: ViewStyle;
  startInLoadingState?: boolean;
  renderLoading?: () => React.ReactElement;
  onLoadProgress?: (event: { nativeEvent: { progress: number } }) => void;
  onError?: (event: { nativeEvent: any }) => void;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  allowsInlineMediaPlayback?: boolean;
  mixedContentMode?: string;
  originWhitelist?: string[];
}

const CrossPlatformWebView: React.FC<CrossPlatformWebViewProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading progress for web
    if (Platform.OS === 'web' && props.onLoadProgress) {
      const timer = setTimeout(() => {
        props.onLoadProgress?.({ nativeEvent: { progress: 0.5 } });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [props.source?.uri]);

  if (Platform.OS === 'web') {
    if (!WebViewForWeb) {
      return (
        <View style={[styles.errorContainer, props.style]}>
          <div style={styles.errorText}>
            Web preview not supported in this environment
          </div>
        </View>
      );
    }

    return (
      <View style={[styles.container, props.style]}>
        {isLoading && props.renderLoading && props.renderLoading()}
        <WebViewForWeb
          {...props}
          onLoad={() => {
            setIsLoading(false);
            props.onLoadProgress?.({ nativeEvent: { progress: 1 } });
          }}
          onError={(error: any) => {
            setIsLoading(false);
            props.onError?.(error);
          }}
        />
      </View>
    );
  }

  // Mobile platform
  if (!WebViewForMobile) {
    return (
      <View style={[styles.errorContainer, props.style]}>
        <div style={styles.errorText}>
          WebView not available. Please install react-native-webview.
        </div>
      </View>
    );
  }

  return <WebViewForMobile {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default CrossPlatformWebView;
