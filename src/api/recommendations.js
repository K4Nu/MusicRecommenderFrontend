import api from "./axios";

export const getRecommendations = () => {
    return api.get("/recommendations");
};
