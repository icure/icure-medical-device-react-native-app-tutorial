import React, { useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { createSelector } from '@reduxjs/toolkit'
import { forceRecaptchaReload, MedTechApiState } from '../../services/api'

interface WebViewComponentProps {
  sitekey: string
  onFinish: (recaptcha: string) => void
}

const selectMedTechApiData = createSelector([(state: { medTechApi: MedTechApiState }) => state.medTechApi], (medTechApi: MedTechApiState) => ({
  recaptchaReloadForced: medTechApi.recaptchaReloadForced,
}))

export const WebViewComponent = ({ sitekey, onFinish }: WebViewComponentProps): JSX.Element => {
  const { recaptchaReloadForced } = useAppSelector(selectMedTechApiData)
  const webViewRef = React.useRef<WebView>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (recaptchaReloadForced) {
      webViewRef.current?.postMessage('reset')
      dispatch(forceRecaptchaReload(false))
    }
  }, [recaptchaReloadForced])

  return (
    <WebView
      ref={webViewRef}
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
                        width: 100%;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                      }
                    .frc-captcha {
                        width: 100%;
                    }
                </style>
              </head>
              <body>
                <div id="frc-captcha" class="frc-captcha" data-start="auto" data-sitekey="${sitekey}" data-callback="doneCallback" data-lang="en"></div>
                <script>
                    window.addEventListener('message', (nativeEvent) => {
                        ReactNativeWebView.postMessage(JSON.stringify({log: nativeEvent?.data === 'reset'}));
                        if (nativeEvent?.data === 'reset') {
                          try {
                            const captcha = friendlyChallenge.autoWidget
                            captcha.reset()
                          } catch (e) { ReactNativeWebView.postMessage(JSON.stringify({log: JSON.stringify(captcha)})); }
                        }
                    });
                  function doneCallback(solution) {
                    ReactNativeWebView.postMessage(JSON.stringify({solution}));
                  }
                </script>

              </body>
            </html>
    `,
      }}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data)

        if (data.solution) {
          onFinish(data.solution)
        } else if (data.log) {
          console.log(data.log)
        }
      }}
      onError={(event) => {
        console.error('WebView error:', event.nativeEvent)
      }}
    />
  )
}
