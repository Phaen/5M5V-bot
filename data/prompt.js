module.exports = (tweetText) => `
Does the author, in ANY part of their message, state their personal intention/desire/inclination to go vegan?
- If so, return the tweet's language in two letters ('en' for English, 'es' for Spanish, 'fr' for French, 'de' for German).
- In any other case, or if the author clearly expressed that they won't go vegan, return 'IGNORE'.

---

${tweetText}    
`;