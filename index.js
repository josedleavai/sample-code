import { writable } from "svelte/store";
import FlexSearch from "flexsearch";

const searching = writable(false);
const searchTerm = writable("");

let postsIndex;
let posts = [];

function createPostsIndex(data) {
  try {
    postsIndex = new FlexSearch.Index({ tokenize: "full" });

    data.forEach((post, i) => {
      const item = `${post.title} ${post.content}`;
      postsIndex.add(i, sanitizeContent(item));
    });

    posts = data;
  } catch (error) {
    console.error("Error creating posts index:", error);
    posts = [];
  }
}

function searchPostsIndex(searchText) {
  if (!searchText.trim() || !/\w/.test(searchText)) return [];

  try {
    const results = postsIndex.search(searchText, { limit: 10 });
    return results.map((idx) => formatPostResult(posts[idx], searchText));
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}

function formatPostResult(post, searchText) {
  return {
    slug: post.slug,
    title: highlightText(post.title, searchText),
    content: getExcerptWithHighlight(post.content, searchText),
  };
}

function getExcerptWithHighlight(text, searchText) {
  const matchPosition = text.toLowerCase().indexOf(searchText.toLowerCase());
  if (matchPosition === -1) return "";

  const start = Math.max(0, matchPosition - 20);
  const end = Math.min(text.length, matchPosition + searchText.length + 80);
  const excerpt = text.substring(start, end).trim();
  const highlightedText = highlightText(excerpt, searchText);

  return `...${highlightedText}...`;
}

function highlightText(text, searchText) {
  const regex = new RegExp(`(${searchText})`, "gi");
  return text.replace(regex, `<mark>$1</mark>`);
}

function sanitizeContent(content) {
  return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export { searching, searchTerm, createPostsIndex, searchPostsIndex };
