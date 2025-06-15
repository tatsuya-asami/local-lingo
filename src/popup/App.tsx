import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [disabledUrls, setDisabledUrls] = useState<string[]>([])

  useEffect(() => {
    chrome.storage.sync.get(['translationEnabled', 'disabledUrls'], (result) => {
      setIsEnabled(result.translationEnabled !== false)
      setDisabledUrls(result.disabledUrls || [])
    })
  }, [])

  const toggleEnabled = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    chrome.storage.sync.set({ translationEnabled: newValue })
  }

  const removeDisabledUrl = (urlToRemove: string) => {
    const newDisabledUrls = disabledUrls.filter(url => url !== urlToRemove)
    setDisabledUrls(newDisabledUrls)
    chrome.storage.sync.set({ disabledUrls: newDisabledUrls })
  }

  return (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Chrome Offline Translator</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>翻訳機能</span>
        <label style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: '50px', 
          height: '26px' 
        }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={toggleEnabled}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isEnabled ? '#4CAF50' : '#ccc',
            transition: '0.2s',
            borderRadius: '26px',
          }}>
            <span style={{
              position: 'absolute',
              content: '',
              height: '20px',
              width: '20px',
              left: isEnabled ? '27px' : '3px',
              top: '3px',
              backgroundColor: 'white',
              transition: '0.2s',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}></span>
          </span>
        </label>
      </div>
      <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        テキストを選択すると翻訳ボタンが表示されます
      </p>
      
      {disabledUrls.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#333' }}>
            無効化されたサイト
          </h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {disabledUrls.map((url, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee'
                }}
              >
                <span style={{ fontSize: '12px', color: '#666', flex: 1 }}>
                  {url}
                </span>
                <button
                  onClick={() => removeDisabledUrl(url)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
