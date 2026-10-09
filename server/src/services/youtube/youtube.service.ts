import axios from "axios";
import prisma from "../../config/database";

const YOUTUBE_API_URL =
  "https://www.googleapis.com/youtube/v3/search";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  description: string;
  url: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults = 3
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults,
        key: apiKey,
        videoEmbeddable: "true",
        safeSearch: "moderate",
      },
    });

    return response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      description: item.snippet.description || "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error: any) {
    console.error(
      "YouTube API error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to search YouTube");
  }
}

// ============================================
// SAVE YOUTUBE RESOURCES FOR LESSON
// ============================================

export async function generateLessonYouTubeResources(
  lessonId: string,
  searchQueries: string[]
) {
  const allVideos: YouTubeVideo[] = [];

  for (const query of searchQueries) {
    const videos = await searchYouTubeVideos(query, 2);

    allVideos.push(...videos);
  }

  // Remove duplicate videos
  const uniqueVideos = Array.from(
    new Map(
      allVideos.map((video) => [
        video.videoId,
        video,
      ])
    ).values()
  );

  const savedVideos = [];

  for (const video of uniqueVideos) {
    const savedVideo =
      await prisma.youTubeResource.upsert({
        where: {
          lessonId_videoId: {
            lessonId,
            videoId: video.videoId,
          },
        },

        create: {
          lessonId,
          videoId: video.videoId,
          title: video.title,
          channelName: video.channelName,
          thumbnail: video.thumbnail,
          description: video.description,
          url: video.url,
          isWatched: false,
          isSaved: false,
        },

        update: {
          title: video.title,
          channelName: video.channelName,
          thumbnail: video.thumbnail,
          description: video.description,
          url: video.url,
        },
      });

    savedVideos.push(savedVideo);
  }

  return savedVideos;
}