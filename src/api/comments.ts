import { api } from "./client";

export const getComments = (requestId: number) => {
  return api.get(`/api/comments/request/${requestId}`);
};

export const addComment = (requestId: number, content: string) => {
  return api.post(`/api/comments/request/${requestId}`, { content });
};

export const deleteComment = (commentId: number) => {
  return api.delete(`/api/comments/${commentId}`);
};
