function invalidText(text) {
    
    if (!text) 
        return { error: "Text is required." };

    if (Object.keys(text).length !== 1) 
        return { error: "Input must contain exactly one key." };
    
    if (!text.text) 
        return { error: "'text' key is missing." };
    
    if (typeof text.text !== "string" || text.text.trim() === "") 
        return { error: "'text' must be a non-empty string." };
    
    return null;
}

module.exports = invalidText;