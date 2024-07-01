import React from 'react'
import { WebView } from 'react-native-webview'

interface WebViewComponentProps {
  sitekey: string
  onFinish: (recaptcha: string) => void
}

export const WebViewComponent = ({ sitekey, onFinish }: WebViewComponentProps): JSX.Element => {
  return (
    <WebView
      originWhitelist={['*']}
      style={{ width: '100%', height: 70 }}
      source={{
        html: `
          <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Friendly Captcha Verification</title>

                <script type="module" src="https://cdn.jsdelivr.net/npm/friendly-challenge@0.9.14/widget.module.min.js" async defer></script>
                <script nomodule src="https://cdn.jsdelivr.net/npm/friendly-challenge@0.9.14/widget.min.js" async defer></script>

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                      }
                </style>
              </head>
              <body>
                <div class="frc-captcha" data-start="auto" data-sitekey="${sitekey}" data-callback="doneCallback" data-lang="en"></div>
                <script>
                console.log('script works')
                  function doneCallback(solution) {
                    console.log('test')
                    ReactNativeWebView.postMessage(solution)
                  }
                </script>

              </body>
            </html>
    `,
      }}
      onMessage={(event) => {
        console.log('Received message from WebView:', event.nativeEvent.data)
        onFinish(event.nativeEvent.data)
      }}
      onError={(event) => {
        console.error('WebView error:', event.nativeEvent)
      }}
      onLoadEnd={() => {
        console.log('WebView content loaded')
      }}
    />
  )
}
