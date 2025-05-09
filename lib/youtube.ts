


// npm install youtube-transcript



import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt";

export async function searchYouTube(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  
  const {data}= await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`,
  );
  if (!data) {
    console.log("youtube fail");
    return null;
  }
  if (data.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }
  return data.items[0].id.videoId;
}


export async function getTranscript (videoId: string) {
    try {
        let transcript_arr=await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en',
        });
        let transcript = ''
        for (let t of transcript_arr){
            transcript += t.text + ''
        }
        return transcript.replaceAll('\n', ' ');
    } catch (error) {
        return "";
    }
}

export async function getQuestionsFromTranscript(transcript: string, course_title: string) {

    type Question = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
    }

    const questions: Question[] = await strict_output(
        'you are a helpful AI that is able to generate MCQ questions and answers. the length of each answer should not be more than 15 words',
        new Array(5).fill(
            `you are to generate a random hard MCQ question about the ${course_title} with context of the following transcript: ${transcript}`
        ),
        {
            question: 'Question',
            answer: 'Answer with max length of 15 words',
            option1: 'Option 1 with max length of 15 words',
            option2: 'Option 2 with max length of 15 words',
            option3: 'Option 3 with max length of 15 words',
        }
    )
    return questions;
}