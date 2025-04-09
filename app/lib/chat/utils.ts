

// Convert API messages to UI message format
export function convertToUIMessages(apiMessages: any[]): any[] {
  if (!apiMessages || !Array.isArray(apiMessages)) {
    return [];
  }
  
  return apiMessages.map((msg) => ({
    id: msg.id || Date.now().toString() + Math.random().toString(36).substring(2, 7),
    type: msg.role === 'assistant' ? 'assistant' : 
          msg.role === 'tool' ? 'tool' :
          msg.role === 'system' ? 'system' : 'user',
    content: msg.content,
    timestamp: new Date(),
  }));
}