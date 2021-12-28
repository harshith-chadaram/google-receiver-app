import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import axios from 'axios';

function App() {
  const context = window.cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  context.start();

  useEffect(() => {
    playerManager.setMessageInterceptor(
      window.cast.framework.messages.MessageType.LOAD,
      request => {
        return new Promise((resolve, reject) => {
          // Fetch content repository by requested contentId
          axios.get('https://storage.googleapis.com/cpe-sample-media/content.json').then((data) => {
            let item = data[request.media.contentId];
            if (!item) {
              // Content could not be found in repository
              reject();
            } else {
              // Add metadata
              let metadata = new window.cast.framework.messages.GenericMediaMetadata();
              metadata.title = item.title;
              metadata.subtitle = item.author;

              request.media.metadata = metadata;
              request.media.contentUrl = item.stream.dash;
              request.media.contentType = 'application/dash+xml';

              // Resolve request
              resolve(request);
            }
          });
        });
      });
  }, [])

  return (
    <div className="App">
      <cast-media-player></cast-media-player>
    </div>
  );
}

export default App;
