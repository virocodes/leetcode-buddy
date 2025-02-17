let chatButton = null;
let chatContainer = null;

// Initialize extension state
chrome.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled) {
        initializeExtension();
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleExtension") {
        if (request.isEnabled) {
            initializeExtension();
        } else {
            removeExtension();
        }
    }
});

function initializeExtension() {
    if (chatButton || chatContainer) return; // Prevent duplicate initialization
    
    // Create chat button
    chatButton = document.createElement("button");
    chatButton.id = "leetcode-buddy-button";
    chatButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 0;
      z-index: 1000;
      overflow: hidden;
      transition: filter 0.2s;
    `;
    chatButton.innerHTML = `
      <img src="${chrome.runtime.getURL('assets/icon.png')}" alt="Leetcode Buddy" style="width: 100%; height: 100%; object-fit: cover;">
    `;

    chatButton.addEventListener('mouseenter', () => {
      chatButton.style.filter = 'brightness(0.8)';
    });

    chatButton.addEventListener('mouseleave', () => {
      chatButton.style.filter = 'brightness(1)';
    });

    // Create chat container
    chatContainer = document.createElement("div");
    chatContainer.id = "leetcode-buddy-container";
    chatContainer.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 30vw;
      height: 830px;
      background-color: rgb(26, 26, 26);
      border: 1px solid rgb(60, 60, 60);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      display: none;
      flex-direction: column;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    chatContainer.innerHTML = `
      <div style="
        padding: 12px 16px;
        background-color: rgb(40, 40, 40);
        color: rgb(255, 255, 255);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgb(60, 60, 60);
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <button id="fullscreen-button" style="
            background-color: transparent;
            border: none;
            color: rgb(170, 170, 170);
            cursor: pointer;
            padding: 0 4px;
            transition: color 0.2s;
            display: flex;
            align-items: center;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
          <select id="model-selector" style="
            background-color: rgb(40, 40, 40);
            color: rgb(255, 255, 255);
            border: 1px solid rgb(60, 60, 60);
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
          ">
            <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
            <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="openai/o3-mini">OpenAI o3 Mini</option>
            <option value="google/gemini-pro">Gemini Pro</option>
            <option value="meta-llama/llama-2-70b-chat">Llama 2 70B</option>
          </select>
        </div>
        
        <button class="x-button" style="
          background-color: transparent;
          border: none;
          color: rgb(170, 170, 170);
          font-size: 20px;
          cursor: pointer;
          padding: 0 4px;
          transition: color 0.2s;
        ">×</button>
      </div>
      <div style="
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        color: rgb(255, 255, 255);
      "></div>
      <div style="
        padding: 8px 16px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      ">
        <button class="prompt-button" style="
          padding: 6px 12px;
          color: rgb(255, 128, 128);
          border: 1px solid rgb(255, 128, 128);
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          transition: filter 0.2s;
        ">Bugfix</button>
        <button class="prompt-button" style="
          padding: 6px 12px;
          color: rgb(255, 223, 128);
          border: 1px solid rgb(255, 223, 128);
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          transition: filter 0.2s;
        ">Explain</button>
        <button class="prompt-button" style="
          padding: 6px 12px;
          color: rgb(144, 238, 144);
          border: 1px solid rgb(144, 238, 144);
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          transition: filter 0.2s;
        ">Optimize</button>
      </div>
      <div style="
        padding-bottom: 16px;
        padding-top: 4px;
        padding-left: 16px;
        padding-right: 16px;
        display: flex;
      ">
        <div style="
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        ">
          <input type="text" placeholder="Ask a question..." style="
            width: 100%;
            padding: 12px 45px 12px 16px;
            border: 1px solid rgb(60, 60, 60);
            border-radius: 999px;
            background-color: rgb(26, 26, 26);
            color: rgb(255, 255, 255);
            font-size: 14px;
            &::placeholder {
              color: rgb(170, 170, 170);
            }
            &:focus {
              outline: none;
              border-color: rgb(255, 161, 22);
            }
          ">
          <button style="
            position: absolute;
            right: 6px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgb(255, 161, 22);
            color: rgb(0, 0, 0);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.2s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    const promptButtons = chatContainer.querySelectorAll('.prompt-button');
    promptButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.filter = 'brightness(0.8)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.filter = 'brightness(1)';
      });
    });

    document.body.appendChild(chatButton);
    document.body.appendChild(chatContainer);

    // Add click handlers
    chatButton.addEventListener("click", () => {
      chatContainer.style.display = chatContainer.style.display === "none" ? "flex" : "none";
    });

    chatContainer.querySelector(".x-button").addEventListener("click", () => {
      chatContainer.style.display = "none";
    });

    chatContainer.querySelector("#fullscreen-button").addEventListener("click", () => {
      chatContainer.style.width = chatContainer.style.width === "95vw" ? "30vw" : "95vw";
    });

    // Get chat elements
    const chatMessages = chatContainer.querySelector("div:nth-child(2)"); // Messages container
    const chatInput = chatContainer.querySelector("input");
    const sendButton = chatContainer.querySelector("div:last-child button");

    // Add conversation history array at the top level
    const problemStatement = getDescription();
    let conversationHistory = [
      {
        role: 'system',
        content: `You are an advanced coding assistant specialized in solving LeetCode problems. 
        Your primary goal is to help users understand the problem deeply and guide them towards the best approach.
        
        When assisting, always:
        1. Identify the core algorithmic pattern(s) relevant to the problem (e.g., Dynamic Programming, Two Pointers, Binary Search, Graph Traversal, etc.).
        2. Explain why this pattern is applicable.
        3. Break down the thought process for solving the problem step by step.
        4. Highlight common pitfalls and edge cases.
        5. Suggest optimizations where possible and explain trade-offs.
        
        The problem that the user is asking about is:
        ${problemStatement}`
      }
    ];

    function escapeHTML(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Add this function to handle syntax highlighting
    function highlightSyntax(code, language) {
      // Define syntax patterns for different languages
      const patterns = {
        // Keywords
        keywords: {
          javascript: /\b(const|let|var|function|return|if|else|for|while|class|extends|new|this|break|continue|try|catch)\b/g,
          python: /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|raise|with)\b/g,
          java: /\b(public|private|class|interface|extends|implements|return|if|else|for|while|new|this|try|catch)\b/g,
        },
        // Strings
        strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
        // Numbers
        numbers: /\b\d+\.?\d*\b/g,
        // Comments
        comments: {
          javascript: /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm,
          python: /#.*$/gm,
          java: /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm,
        },
        // Function calls
        functions: /\b\w+(?=\s*\()/g,
      };

      // Choose language patterns or default to javascript
      const languagePatterns = {
        keywords: patterns.keywords[language] || patterns.keywords.javascript,
        comments: patterns.comments[language] || patterns.comments.javascript,
      };

      // Escape HTML characters first
      let highlighted = escapeHTML(code);

      // Apply syntax highlighting with spans
      highlighted = highlighted
        // Highlight comments first (to prevent other rules from applying inside comments)
        .replace(languagePatterns.comments, match => 
          `<span style="color: #6a9955;">${match}</span>`)
        // Highlight strings
        .replace(patterns.strings, match => 
          `<span style="color: #ce9178;">${match}</span>`)
        // Highlight numbers
        .replace(patterns.numbers, match => 
          `<span style="color: #b5cea8;">${match}</span>`)
        // Highlight keywords
        .replace(languagePatterns.keywords, match => 
          `<span style="color: #569cd6;">${match}</span>`)
        // Highlight function calls
        .replace(patterns.functions, match => 
          `<span style="color: #dcdcaa;">${match}</span>`);

      return highlighted;
    }

    // Update the parseMarkdown function to use our syntax highlighter
    function parseMarkdown(text) {
      // Update code block handling with syntax highlighting
      text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        const highlightedCode = highlightSyntax(code.trim(), lang);
        return `
          <div class="code-block-container" style="position: relative;">
            <pre style="
              background-color: #1e1e1e;
              padding: 12px;
              border-radius: 6px;
              overflow-x: auto;
              margin: 8px 0;
            "><code style="
              font-family: 'Fira Code', monospace;
              white-space: pre;
              text-shadow: none;
              font-size: 13px;
            ">${highlightedCode}</code></pre>
            <button class="copy-code-button" data-code="${escapeHTML(code.trim())}" style="
              position: absolute;
              top: 8px;
              right: 8px;
              padding: 4px 8px;
              background-color: rgb(255, 161, 22);
              color: rgb(0, 0, 0);
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              opacity: 0;
              transition: opacity 0.2s;
            ">Copy Code</button>
          </div>
        `;
      });

      text = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
        .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
        .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text

      // Handle inline code
      text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Handle bold
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Handle italic
      text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Handle links
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

      // Handle unordered lists
      text = text.replace(/^\s*-\s+(.+)/gm, '<li>$1</li>');
      text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

      // Handle ordered lists
      text = text.replace(/^\s*\d+\.\s+(.+)/gm, '<li>$1</li>');
      text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

      // Handle paragraphs
      text = text.replace(/\n\n/g, '</p><p>');
      text = `<p>${text}</p>`;

      return text;
    }

    function getDescription() {
      const metaDescriptionEl = document.querySelector('meta[name=description]')
      const problemStatement = metaDescriptionEl?.getAttribute('content')
      console.log(problemStatement);
      return problemStatement;
    }

    // Function to add a message to the chat
    function addMessage(text, isUser = false) {
      const messageDiv = document.createElement("div");
      messageDiv.style.cssText = `
        margin-bottom: 12px;
        display: flex;
        ${isUser ? 'justify-content: flex-end' : 'width: 100%'}
      `;
      
      const bubble = document.createElement("div");
      bubble.style.cssText = `
        ${isUser ? `
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          background-color: rgb(255, 161, 22);
          color: rgb(0, 0, 0);
        ` : `
          width: 100%;
          color: rgb(255, 255, 255);
        `}
      `;

      // Add styles for code blocks
      const parsedText = parseMarkdown(text);
      bubble.innerHTML = parsedText;
      
      // Apply styles to all code blocks
      bubble.querySelectorAll('pre').forEach(pre => {
        pre.style.cssText = `
          background-color: #1e1e1e;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 8px 0;
        `;
      });

      bubble.querySelectorAll('code').forEach(code => {
        code.style.cssText = `
          font-family: monospace;
          white-space: pre;
        `;
      });

      // Add hover effect for code block containers
      bubble.querySelectorAll('.code-block-container').forEach(container => {
        container.addEventListener('mouseenter', () => {
          const applyButton = container.querySelector('.copy-code-button');
          if (applyButton) {
            applyButton.style.opacity = '1';
          }
        });

        container.addEventListener('mouseleave', () => {
          const applyButton = container.querySelector('.copy-code-button');
          if (applyButton) {
            applyButton.style.opacity = '0';
          }
        });
      });

      // Replace apply button handlers with copy button handlers
      bubble.querySelectorAll('.copy-code-button').forEach(button => {
        button.addEventListener('click', async () => {
          const code = button.getAttribute('data-code');
          if (code) {
            // Show loading state
            const originalText = button.textContent;
            button.textContent = 'Copying...';
            button.style.backgroundColor = '#666';
            button.disabled = true;

            try {
              await navigator.clipboard.writeText(code);
              // Show success state
              button.textContent = 'Copied!';
              button.style.backgroundColor = '#4CAF50';
            } catch (error) {
              // Show error state
              button.textContent = 'Error';
              button.style.backgroundColor = '#f44336';
              console.error('Error copying code:', error);
            }
            
            // Reset button after 2 seconds
            setTimeout(() => {
              button.textContent = originalText;
              button.style.backgroundColor = 'rgb(255, 161, 22)';
              button.disabled = false;
            }, 2000);
          }
        });
      });

      messageDiv.appendChild(bubble);
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return messageDiv;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
      const indicator = addMessage(".", false);
      const bubble = indicator.querySelector("div");
      
      let dots = 0;
      const typingAnimation = setInterval(() => {
        dots = (dots + 1) % 4;
        bubble.textContent = ".".repeat(dots);
      }, 500);
      
      return { indicator, typingAnimation };
    }

    function getEditorContent() {
      const codeContainer = document.querySelectorAll('.view-line');
      const code = Array.from(codeContainer).map(child => child.textContent || '').join('\n');
      console.log(code);
      return code;
    }

    // Handle sending messages
    function handleSend() {
      const message = chatInput.value.trim();
      if (message) {
        addMessage(message, true);
        chatInput.value = '';
        
        const { indicator, typingAnimation } = showTypingIndicator();

        const editorContent = getEditorContent();
        const editedMessage = `
          This is the code that the user is asking about:
          <code>
            ${editorContent}
          </code>
          Respond to the user making sure to use the code as context:
          <user-message>
            ${message}
          </user-message>

          Respond carefully, considering the provided code context. If relevant, suggest alternative approaches, optimizations, or improvements. Make sure to explain your reasoning clearly.
        `;
        conversationHistory.push({ role: 'user', content: editedMessage });

        // Get the currently selected model value right before making the API call
        const modelSelector = chatContainer.querySelector('#model-selector');
        const selectedModel = modelSelector ? modelSelector.value : 'deepseek/deepseek-chat';

        // Create message container for streaming response
        clearInterval(typingAnimation);
        indicator.remove();
        const messageDiv = addMessage(''); // Empty message to start
        const messageBubble = messageDiv.querySelector('div');
        let streamedContent = '';

        fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': process.env.OPENROUTER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: conversationHistory,
            stream: true,
          })
        }).then(response => {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Response body is not readable');

          const decoder = new TextDecoder();
          let buffer = '';

          function processStream() {
            return reader.read().then(({done, value}) => {
              if (done) {
                conversationHistory.push({ role: 'assistant', content: streamedContent });
                return;
              }

              buffer += decoder.decode(value, { stream: true });

              while (true) {
                const lineEnd = buffer.indexOf('\n');
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') return;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      streamedContent += content;
                      // Update the message with parsed markdown for the entire content so far
                      messageBubble.innerHTML = parseMarkdown(streamedContent);
                      
                      // Reapply code block hover effects
                      messageBubble.querySelectorAll('.code-block-container').forEach(container => {
                        container.addEventListener('mouseenter', () => {
                          const copyButton = container.querySelector('.copy-code-button');
                          if (copyButton) copyButton.style.opacity = '1';
                        });
                        container.addEventListener('mouseleave', () => {
                          const copyButton = container.querySelector('.copy-code-button');
                          if (copyButton) copyButton.style.opacity = '0';
                        });
                      });

                      // Reattach copy button handlers
                      messageBubble.querySelectorAll('.copy-code-button').forEach(button => {
                        button.addEventListener('click', async () => {
                          const code = button.getAttribute('data-code');
                          if (code) {
                            const originalText = button.textContent;
                            button.textContent = 'Copying...';
                            button.style.backgroundColor = '#666';
                            button.disabled = true;

                            try {
                              await navigator.clipboard.writeText(code);
                              button.textContent = 'Copied!';
                              button.style.backgroundColor = '#4CAF50';
                            } catch (error) {
                              button.textContent = 'Error';
                              button.style.backgroundColor = '#f44336';
                            }

                            setTimeout(() => {
                              button.textContent = originalText;
                              button.style.backgroundColor = 'rgb(255, 161, 22)';
                              button.disabled = false;
                            }, 2000);
                          }
                        });
                      });

                      // Scroll to bottom as content streams in
                      chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                  } catch (e) {
                    // Ignore invalid JSON
                  }
                }
              }

              return processStream();
            });
          }

          return processStream();
        }).catch(error => {
          messageBubble.innerHTML = parseMarkdown("Sorry, I'm having trouble processing your request. Please try again later.");
          console.error('Error:', error);
        });
      }
    }

    sendButton.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    });

    // Define custom prompts for each button
    const promptTemplates = {
      'Bugfix': `Please analyze my code for potential issues and suggest improvements by checking:
    1. Off-by-one errors and incorrect loop conditions.
    2. Boundary conditions and edge cases.
    3. Handling of null, undefined, or invalid inputs.
    4. Inefficient memory usage and potential memory leaks.
    5. Incorrect logic, misuse of data structures, or redundant calculations.
    6. Potential infinite loops or excessive recursion.
    
    For each issue found, provide a detailed explanation and suggest fixes.`,
    
      'Explain': `Help me understand the following aspects of this problem and its solution:
    1. What algorithmic pattern(s) does this problem belong to (e.g., DFS, Sliding Window, Dynamic Programming, etc.)?
    2. Why is this pattern the best choice?
    3. What are the key steps in implementing the solution?
    4. What are the time and space complexity considerations?
    5. What are the important edge cases to account for?
    6. How can I generalize this pattern to similar problems?`,
    
      'Optimize': `Help me optimize this code by focusing on:
    1. Reducing time complexity by identifying unnecessary operations or using better algorithms.
    2. Minimizing space complexity by eliminating redundant storage.
    3. Improving code readability by restructuring or using more expressive syntax.
    4. Identifying better data structures that would lead to a more efficient solution.
    5. Utilizing built-in functions or language-specific optimizations where applicable.
    
    For each suggestion, provide a clear explanation of why it improves the solution and how it applies to similar problems.`
    };

    // Update the click handlers for prompt buttons
    promptButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent;
        const customPrompt = promptTemplates[buttonText];
        if (customPrompt) {
          chatInput.value = customPrompt;
          handleSend();
        }
      });
    });

    function createChatInterface() {
      const container = document.createElement("div");
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        min-width: 300px;
        min-height: 400px;
        background-color: rgb(49, 49, 49);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        resize: both;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;

      const chatHistory = document.createElement("div");
      chatHistory.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
      `;

      // ... rest of the function remains the same ...
    }

    // Replace the applyCodeToEditor function with a simpler version that directly accesses the editor
    function applyCodeToEditor(code) {
        try {
            const monacoInstance = window.monaco?.editor?.getEditors()[0];
            if (monacoInstance) {
                const model = monacoInstance.getModel();
                monacoInstance.executeEdits("", [{ 
                    range: model.getFullModelRange(), 
                    text: code 
                }]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update editor:', error);
            return false;
        }
    }

    // Optional: Add Fira Code font for better code rendering
    const firaCodeFont = document.createElement('link');
    firaCodeFont.rel = 'stylesheet';
    firaCodeFont.href = 'https://fonts.googleapis.com/css2?family=Fira+Code&display=swap';
    document.head.appendChild(firaCodeFont);
}

function removeExtension() {
    if (chatButton) {
        chatButton.remove();
        chatButton = null;
    }
    if (chatContainer) {
        chatContainer.remove();
        chatContainer = null;
    }
}
