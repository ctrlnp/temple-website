const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// YouTube API setup
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Set credentials if available
if (process.env.YOUTUBE_ACCESS_TOKEN && process.env.YOUTUBE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    access_token: process.env.YOUTUBE_ACCESS_TOKEN,
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });
}

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

// Get OAuth2 authorization URL
const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to show
  });
};

// Set OAuth2 tokens after authorization
const setCredentials = (code) => {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        reject(err);
        return;
      }

      oauth2Client.setCredentials(tokens);
      resolve(tokens);
    });
  });
};

// Upload video to YouTube
const uploadVideoToYouTube = async (filePath, metadata) => {
  try {
    const { title, description, eventName } = metadata;

    // Prepare video metadata
    const videoMetadata = {
      snippet: {
        title: title || `Temple Event: ${eventName}`,
        description: description || `Video from ${eventName} temple event`,
        tags: ['temple', 'event', eventName.toLowerCase()],
        categoryId: '22', // People & Blogs category
      },
      status: {
        privacyStatus: 'unlisted', // Can be 'public', 'private', or 'unlisted'
      },
    };

    // Create readable stream from file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
    });

    // Upload video
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: videoMetadata,
      media: {
        body: fileStream,
      },
    });

    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return {
      videoId,
      url: videoUrl,
      embedUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };

  } catch (error) {
    console.error('YouTube upload error:', error);
    throw new Error('Failed to upload video to YouTube');
  }
};

// Get video details
const getVideoDetails = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      id: videoId,
    });

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.default.url,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
};

module.exports = {
  oauth2Client,
  youtube,
  getAuthUrl,
  setCredentials,
  uploadVideoToYouTube,
  getVideoDetails,
};
