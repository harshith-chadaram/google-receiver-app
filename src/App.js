import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import axios from 'axios';

function App() {
  const context = window.window.cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  //Media Sample API Values
  const SAMPLE_URL = "https://storage.googleapis.com/cpe-sample-media/content.json";
  const StreamType = {
    DASH: 'application/dash+xml',
    HLS: 'application/x-mpegurl'
  }
  const TEST_STREAM_TYPE = StreamType.DASH

  // Debug Logger
  const castDebugLogger = window.window.cast.debug.CastDebugLogger.getInstance();
  const LOG_TAG = 'MyAPP.LOG';

  // Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
  castDebugLogger.setEnabled(true);

  // Show debug overlay
  // castDebugLogger.showDebugLogs(true);

  // Set verbosity level for Core events.
  castDebugLogger.loggerLevelByEvents = {
    'window.window.cast.framework.events.category.CORE': window.window.cast.framework.LoggerLevel.INFO,
    'window.window.cast.framework.events.EventType.MEDIA_STATUS': window.window.cast.framework.LoggerLevel.DEBUG
  }

  // Set verbosity level for custom tags.
  castDebugLogger.loggerLevelByTags = {
    LOG_TAG: window.window.cast.framework.LoggerLevel.DEBUG,
  };

  useEffect(() => {
    playerManager.setMessageInterceptor(
      window.window.cast.framework.messages.MessageType.LOAD,
      request => {
        castDebugLogger.info(LOG_TAG, 'Intercepting LOAD request');
        // Fetch content repository by requested contentId
        axios.get(SAMPLE_URL).then((data) => {
          let item = data[request.media.contentId];
          if (!item) {
            // Content could not be found in repository
            castDebugLogger.error(LOG_TAG, 'Content not found');
          } else {
            // Adjusting request to make requested content playable
            request.media.contentType = TEST_STREAM_TYPE;

            // Configure player to parse DASH content
            if (TEST_STREAM_TYPE == StreamType.DASH) {
              request.media.contentUrl = item.stream.dash;
            }

            // Configure player to parse HLS content
            else if (TEST_STREAM_TYPE == StreamType.HLS) {
              request.media.contentUrl = item.stream.hls
              request.media.hlsSegmentFormat = window.cast.framework.messages.HlsSegmentFormat.FMP4;
              request.media.hlsVideoSegmentFormat = window.cast.framework.messages.HlsVideoSegmentFormat.FMP4;
            }

            castDebugLogger.warn(LOG_TAG, 'Playable URL:', request.media.contentUrl);

            // Add metadata
            let metadata = new window.cast.framework.messages.GenericMediaMetadata();
            metadata.title = item.title;
            metadata.subtitle = item.author;

            request.media.metadata = metadata;
          }
        });
      });
    // Optimizing for smart displays
    const touchControls = window.cast.framework.ui.Controls.getInstance();
    const playerData = new window.cast.framework.ui.PlayerData();
    const playerDataBinder = new window.cast.framework.ui.PlayerDataBinder(playerData);

    let browseItems = getBrowseItems();

    function getBrowseItems() {
      let browseItems = [];
      axios.get(SAMPLE_URL)
        .then(function (data) {
          for (let key in data) {
            let item = new window.cast.framework.ui.BrowseItem();
            item.entity = key;
            item.title = data[key].title;
            item.subtitle = data[key].description;
            item.image = new window.cast.framework.messages.Image(data[key].poster);
            item.imageType = window.cast.framework.ui.BrowseImageType.MOVIE;
            browseItems.push(item);
          }
        });
      return browseItems;
    }

    let browseContent = new window.cast.framework.ui.BrowseContent();
    browseContent.title = 'Up Next';
    browseContent.items = browseItems;
    browseContent.targetAspectRatio =
      window.cast.framework.ui.BrowseImageAspectRatio.LANDSCAPE_16_TO_9;

    playerDataBinder.addEventListener(
      window.cast.framework.ui.PlayerDataEventType.MEDIA_CHANGED,
      (e) => {
        if (!e.value) return;

        // Media browse
        touchControls.setBrowseContent(browseContent);

        // Clear default buttons and re-assign
        touchControls.clearDefaultSlotAssignments();
        touchControls.assignButton(
          window.cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
          window.cast.framework.ui.ControlsButton.SEEK_BACKWARD_30
        );
      });

    context.start();
  }, [])

  return (
    <div className="App">
      <cast-media-player></cast-media-player>
    </div>
  );
}

export default App;
