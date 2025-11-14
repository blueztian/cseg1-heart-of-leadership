// Game state
let currentScene = 0;
let playerChoices = [];
let selectedCharacter = 'alex';
let isTyping = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-btn').addEventListener('click', showCharacterSelect);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    document.getElementById('exit-btn').addEventListener('click', exitGame);
    document.getElementById('replay-btn').addEventListener('click', restartGame);
    document.getElementById('menu-btn').addEventListener('click', showMainMenu);
    document.getElementById('dialogue-box').addEventListener('click', handleDialogueClick);
});

// Menu functions
function showCharacterSelect() {
    playSound('click');
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('character-select').style.display = 'block';
}

function selectCharacter(character) {
    playSound('click');
    selectedCharacter = character;
    document.getElementById('character-select').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('ending-screen').style.display = 'none';
    
    // Reset game state
    currentScene = 0;
    playerChoices = [];
    updateBodyTone('balanced');
    loadScene(0);
}

function handleDialogueClick() {
    if (!isTyping) {
        const scene = getScene(currentScene);
        if (scene && scene.dialogue) {
            // If dialogue is done, show choices
            const dialogueText = document.getElementById('dialogue-text');
            if (dialogueText.textContent === scene.dialogue) {
                showChoices(scene);
            }
        }
    }
}

// Scene management
function loadScene(sceneIndex) {
    const scenes = getAllScenes();
    if (sceneIndex >= scenes.length) {
        endGame();
        return;
    }
    
    const scene = scenes[sceneIndex];
    if (!scene) {
        endGame();
        return;
    }
    
    // Hide choices
    document.getElementById('question-prompt').style.display = 'none';
    document.getElementById('choice1').style.visibility = 'hidden';
    document.getElementById('choice2').style.visibility = 'hidden';
    
    // Don't update tone here - only after choices are made
    
    // Show dialogue
    const dialogueText = document.getElementById('dialogue-text');
    dialogueText.innerHTML = '';
    isTyping = true;
    
    // Build full text with question if it exists
    let fullText = scene.dialogue;
    if (scene.question && scene.choice1 !== "Continue" && scene.choice2 !== "Continue") {
        fullText += "\n\n" + scene.question;
    }
    
    typeText(dialogueText, fullText, () => {
            isTyping = false;
        if (scene.choice1 === "Continue" && scene.choice2 === "Continue") {
            setTimeout(() => {
                currentScene++;
                loadScene(currentScene);
            }, 800);
        } else {
            setTimeout(() => showChoices(scene), 500);
        }
    });
}

function typeText(element, text, callback) {
    let index = 0;
    const chars = text.split('');
    
    function typeChar() {
        if (index < chars.length) {
            element.textContent += chars[index];
            index++;
            if (index % 5 === 0) {
                playSound('typing', 0.1);
            }
            setTimeout(typeChar, 30);
        } else {
            if (callback) callback();
        }
    }
    
    typeChar();
}

function showChoices(scene) {
    const choice1 = document.getElementById('choice1');
    const choice2 = document.getElementById('choice2');
    const choice1Text = choice1.querySelector('.choice-text');
    const choice2Text = choice2.querySelector('.choice-text');
    
    // Hide the question-prompt (we show question in dialogue box instead)
    document.getElementById('question-prompt').style.display = 'none';
    
    choice1Text.textContent = scene.choice1;
    choice2Text.textContent = scene.choice2;
    
    choice1.style.visibility = 'visible';
    choice2.style.visibility = 'visible';
    choice1.style.opacity = '1';
    choice2.style.opacity = '1';
}

function makeChoice(choice) {
    if (isTyping) return;
    
    playSound('click');
    playerChoices.push(choice);
    
    // Update background tone based on choice
    if (choice === 1) {
        updateBodyTone('leadership');
    } else if (choice === 2) {
        updateBodyTone('romance');
    }
    
    // Hide choices
    document.getElementById('choice1').style.opacity = '0';
    document.getElementById('choice2').style.opacity = '0';
    
    setTimeout(() => {
        currentScene++;
        loadScene(currentScene);
    }, 300);
}

// Story data
function getAllScenes() {
    if (selectedCharacter === 'alex') {
        return getAlexScenes();
    } else {
        return getJordanScenes();
    }
}

function getAlexScenes() {
    const scenes = [];
    const path = getPath();
    
    // Always add these scenes
    scenes.push({ dialogue: "You are Alex, a dedicated student leader organizing the Annual Leadership Summit. With only two weeks until the event, the pressure is mounting.", choice1: "Continue", choice2: "Continue" });
    scenes.push({ dialogue: "But there's someone else on your mind: Jordan, a classmate you've been growing closer to. Your phone buzzes with a message from Jordan asking if you want to grab coffee this afternoon.", choice1: "Continue", choice2: "Continue" });
    scenes.push({
        dialogue: "But you also have a critical committee meeting in an hour. You're torn between your responsibilities and your heart.", 
        question: "What matters more to you right now—fulfilling your leadership duties or nurturing this growing connection?",
        choice1: "Attend the committee meeting", 
        choice2: "Spend time with Jordan" 
    });
    
    // First choice result (only show if choice was made)
    if (path.firstChoice === 1) {
        scenes.push({ dialogue: "You attend the meeting. It's productive and your team appreciates your dedication. Later, Jordan's reply is understanding but brief.", choice1: "Continue", choice2: "Continue" });
    } else if (path.firstChoice === 2) {
        scenes.push({ dialogue: "You spend time with Jordan. The afternoon is perfect and your connection deepens. However, some team members seem disappointed when you reschedule the meeting.", choice1: "Continue", choice2: "Continue" });
    }
    
    // Week later (only show if first choice was made)
    if (path.firstChoice !== undefined) {
        scenes.push({ dialogue: "A week passes. The event is now just one week away and pressure is intensifying. Your coordinator Sarah approaches with concerns about tasks falling behind.", choice1: "Continue", choice2: "Continue" });
            scenes.push({
            dialogue: "You need to decide how to handle this mounting pressure.", 
            question: "Do you trust your team to step up, or do you need to take control to ensure nothing goes wrong?",
            choice1: "Delegate tasks to the team", 
            choice2: "Take on more responsibilities yourself" 
        });
        
        // Second choice result
        if (path.secondChoice === 1) {
            scenes.push({ dialogue: "You delegate tasks. Your team rises to the occasion and you find more time to breathe. The balance feels more sustainable.", choice1: "Continue", choice2: "Continue" });
        } else if (path.secondChoice === 2) {
            scenes.push({ dialogue: "You take on more responsibilities. Everything progresses smoothly, but you notice Jordan's messages becoming less frequent as you postpone replies.", choice1: "Continue", choice2: "Continue" });
        }
        
        // New Scene: Stress builds as event day nears (only show if second choice was made)
    if (path.secondChoice !== undefined) {
            scenes.push({
                dialogue: "As the event day approaches, your stress levels rise. There's so much to do and so little time. You feel like you're barely holding it together.", 
                question: "Do you take a moment to breathe, or do you push through the stress?",
                choice1: "Take a short break to clear your head", 
                choice2: "Push through the stress and keep working" 
            });
            
            // Third choice result
            if (path.thirdChoice === 1) {
                scenes.push({ dialogue: "You take a brief break, stepping outside for some fresh air. The cool breeze calms your mind for a moment, and you return to work feeling a bit more focused.", choice1: "Continue", choice2: "Continue" });
            } else if (path.thirdChoice === 2) {
                scenes.push({ dialogue: "You decide to keep pushing through the stress, working late into the night. Your body feels drained, but you tell yourself it's worth it for the success of the event.", choice1: "Continue", choice2: "Continue" });
            }
            
            // New Scene: Conflict with Sarah (only show if third choice was made)
            if (path.thirdChoice !== undefined) {
                scenes.push({
                    dialogue: "Sarah comes to you with a complaint—some of the committee members are feeling overworked and are considering quitting. The pressure is getting to everyone.", 
                    question: "Do you try to console your team, or do you continue to focus on the tasks at hand?",
                    choice1: "Console the team and find a solution", 
                    choice2: "Stay focused on the tasks and push forward" 
                });
                
                // Fourth choice result
                if (path.fourthChoice === 1) {
                    scenes.push({ dialogue: "You sit down with the team and listen to their concerns. Together, you come up with a new plan that reduces everyone's workload. They seem reassured.", choice1: "Continue", choice2: "Continue" });
                } else if (path.fourthChoice === 2) {
                    scenes.push({ dialogue: "You decide to stay focused, telling the team they need to push through. However, some of them look frustrated, and Sarah's worried glance doesn't go unnoticed.", choice1: "Continue", choice2: "Continue" });
                }
            }
        }
        
        // Event day (only show if fourth choice was made)
        if (path.fourthChoice !== undefined) {
            scenes.push({ dialogue: "The day of the event arrives. As you scan the crowd, you see Jordan standing near the back. They catch your eye.", choice1: "Continue", choice2: "Continue" });
            
            // New Scene: A moment of vulnerability with Jordan
            scenes.push({
                dialogue: "You're walking through the venue when you spot Jordan again. For a moment, everything else fades away. You finally have the chance to talk, but the chaos of the event is still weighing on you.", 
                question: "Do you take the time to talk to Jordan, or do you stay focused on your duties?",
                choice1: "Talk to Jordan and try to reconnect", 
                choice2: "Stay focused on the event and postpone the conversation" 
            });
            
            // Fifth choice result
            if (path.fifthChoice === 1) {
                scenes.push({ dialogue: "You pull Jordan aside for a brief conversation. They listen intently as you talk about the challenges you're facing. The connection between you feels stronger, but time is limited.", choice1: "Continue", choice2: "Continue" });
            } else if (path.fifthChoice === 2) {
                scenes.push({ dialogue: "You decide to focus on the event, knowing there are still so many tasks to complete. Jordan seems to understand, but a part of you feels guilty for not taking the time to talk.", choice1: "Continue", choice2: "Continue" });
            }
            
            // New Scene: Event Day – A potential crisis (only show if fifth choice was made)
            if (path.fifthChoice !== undefined) {
                scenes.push({
                    dialogue: "The event begins, but there's a major setback—a projector fails, and the first speaker is running late. Everyone looks to you for guidance.", 
                    question: "Do you handle the crisis or trust someone else to take charge?",
                    choice1: "Take charge and solve the issue yourself", 
                    choice2: "Delegate the crisis management to someone else" 
                });
                
                // Sixth choice result
                if (path.sixthChoice === 1) {
                    scenes.push({ dialogue: "You step in and handle the situation with calm professionalism. The projector is fixed, and the first speaker arrives just in time. Everyone is impressed with your leadership.", choice1: "Continue", choice2: "Continue" });
                } else if (path.sixthChoice === 2) {
                    scenes.push({ dialogue: "You delegate the task to another committee member. While the issue is resolved, you can't help but feel like you're losing control of the situation.", choice1: "Continue", choice2: "Continue" });
                }
            }
            
            // Final Scene: The end of the event (only show if sixth choice was made)
            if (path.sixthChoice !== undefined) {
                scenes.push({
                    dialogue: "The event is over, and as you look around, you feel a sense of accomplishment. But you can't help but wonder: Was it worth it? Did you sacrifice something valuable along the way?", 
                    question: "How do you want to process this experience?",
                    choice1: "Reflect on the journey and its lessons", 
                    choice2: "Celebrate the success, but push the doubts away" 
                });
                
                // Seventh choice result
                if (path.seventhChoice === 1) {
                    scenes.push({ dialogue: "You take a quiet moment to reflect on everything you've learned from this experience. While it was challenging, you feel proud of how far you've come and the people you've helped.", choice1: "Continue", choice2: "Continue" });
                } else if (path.seventhChoice === 2) {
                    scenes.push({ dialogue: "You celebrate the success with your team, putting aside any doubts. It was a job well done, and you're happy it's over. But deep down, you wonder if you could've balanced things differently.", choice1: "Continue", choice2: "Continue" });
                }
            }
        }
    }
    
    return scenes;
}

function getJordanScenes() {
    const scenes = [];
    const path = getPath();
    
    // Always add these scenes
    scenes.push({ dialogue: "You are Jordan, and you've been growing closer to Alex, a student leader organizing the Annual Leadership Summit. You decide to text them asking if they want to grab coffee.", choice1: "Continue", choice2: "Continue" });
    scenes.push({
        dialogue: "You know Alex has a meeting soon. The timing isn't ideal, but you're hoping they might make time for you.", 
        question: "How do you want to approach this—respectfully wait for their response, or let them know how much you want to see them?",
        choice1: "Wait for Alex's response", 
        choice2: "Emphasize how much you want to see them" 
    });
    
    // First choice result (only show if choice was made)
    if (path.firstChoice === 1) {
        scenes.push({ dialogue: "You wait patiently. Alex explains they have a meeting and asks to reschedule. You respond with understanding, but as days pass, you notice Alex becoming increasingly busy and distant.", choice1: "Continue", choice2: "Continue" });
    } else if (path.firstChoice === 2) {
        scenes.push({ dialogue: "You emphasize wanting to see them. Alex reschedules and you have a perfect afternoon together. However, as the week progresses, you notice Alex struggling to balance everything.", choice1: "Continue", choice2: "Continue" });
    }
    
    // New Scene: Feeling neglected (only show if first choice was made)
    if (path.firstChoice !== undefined) {
            scenes.push({
            dialogue: "You try texting Alex again, but the replies are short and infrequent. You start to feel neglected as their focus on the event becomes all-consuming.", 
            question: "How do you feel about the situation now—understanding, or frustrated?",
            choice1: "Understand and give them space", 
            choice2: "Express your frustration and ask for attention" 
        });
        
        // Third choice result (feeling neglected)
        if (path.thirdChoice === 1) {
            scenes.push({ dialogue: "You decide to give Alex space, hoping they'll come around once the event is over. But a part of you wonders if the connection is fading.", choice1: "Continue", choice2: "Continue" });
        } else if (path.thirdChoice === 2) {
            scenes.push({ dialogue: "You express your frustration to Alex, letting them know you miss them and wish they had time for you. The conversation is tense, but Alex promises to make time soon.", choice1: "Continue", choice2: "Continue" });
        }
    }
    
    // Week later (only show if third choice was made)
    if (path.thirdChoice !== undefined) {
        scenes.push({
            dialogue: "A week passes. The event is one week away. You hear through mutual friends that there are issues with event planning—tasks falling behind schedule, logistical problems, and mounting pressure.", 
            question: "Do you reach out to offer comfort and support, or do you step back to give Alex space to focus?",
            choice1: "Reach out and offer support", 
            choice2: "Give them space to focus" 
        });
        
        // Second choice result
        if (path.secondChoice === 1) {
            scenes.push({ dialogue: "You reach out with support. Alex responds with gratitude and your relationship feels stronger through this challenging time.", choice1: "Continue", choice2: "Continue" });
        } else if (path.secondChoice === 2) {
            scenes.push({ dialogue: "You give Alex space. The days pass quietly, but the silence is difficult. You miss them and worry about the growing distance.", choice1: "Continue", choice2: "Continue" });
        }
        
        // Event day (only show if second choice was made)
        if (path.secondChoice !== undefined) {
            scenes.push({ dialogue: "The day of the event arrives. You attend to support Alex. As you scan the room, you spot Alex and your eyes meet.", choice1: "Continue", choice2: "Continue" });
            
            if (path.leadershipCount >= 2) {
                scenes.push({ dialogue: "Alex gives you a small, polite nod, but there's distance in their expression. You realize something precious may have been lost.", choice1: "Continue", choice2: "Continue" });
            } else if (path.romanceCount >= 2) {
                scenes.push({ dialogue: "Alex smiles warmly at you. The connection is still strong and you can see they're happy you're here.", choice1: "Continue", choice2: "Continue" });
            } else {
                scenes.push({ dialogue: "Alex gives you a small smile, but something feels uncertain. The relationship feels fragile.", choice1: "Continue", choice2: "Continue" });
            }
            
            // New Scene: Supporting Alex through the chaos
            scenes.push({
                dialogue: "As the event day arrives, you decide to support Alex from behind the scenes. You offer help wherever you can, even if it's just keeping them company during stressful moments.", 
                question: "Do you continue to stay in the background, or do you step forward and take on more responsibility?",
                choice1: "Stay in the background and support", 
                choice2: "Step forward and offer more help" 
            });
            
            // Fourth choice result (supporting Alex)
            if (path.fourthChoice === 1) {
                scenes.push({ dialogue: "You quietly offer your help when needed, not seeking any spotlight. You feel good knowing you're there for Alex, but you also wonder if your role in their life is diminishing.", choice1: "Continue", choice2: "Continue" });
            } else if (path.fourthChoice === 2) {
                scenes.push({ dialogue: "You step forward and take on more responsibility. Alex appreciates the extra support, but you notice they're still distant, absorbed in the chaos of the event.", choice1: "Continue", choice2: "Continue" });
            }
            
            // New Scene: Reconnecting after the event (only show if fourth choice was made)
            if (path.fourthChoice !== undefined) {
                scenes.push({
                    dialogue: "The event is finally over, and you both have a moment to breathe. Alex looks at you, tired but with a grateful smile. You realize how much you've both been through.", 
                    question: "Do you take the opportunity to talk about your relationship, or do you keep it light and casual?",
                    choice1: "Talk openly about your feelings", 
                    choice2: "Keep it casual and enjoy the moment" 
                });
                
                // Fifth choice result (reconnecting)
                if (path.fifthChoice === 1) {
                    scenes.push({ dialogue: "You both sit down and talk about everything—the pressures of the event, the growing distance, and the things that matter most. It's an honest conversation, and while it's tough, you feel closer than ever.", choice1: "Continue", choice2: "Continue" });
                } else if (path.fifthChoice === 2) {
                    scenes.push({ dialogue: "You keep the conversation light, enjoying the moment without diving into any heavy topics. It's a nice break from everything, and you're glad to just be with Alex for a while.", choice1: "Continue", choice2: "Continue" });
                }
            }
            
            // Final Scene: Moving forward (only show if fifth choice was made)
            if (path.fifthChoice !== undefined) {
                scenes.push({
                    dialogue: "As the dust settles, you wonder what the future holds for you and Alex. Will you both find a way to balance your lives, or will the pressures of leadership and love drive a wedge between you?", 
                    question: "How do you want to approach the future?",
                    choice1: "Look forward to the possibilities", 
                    choice2: "Prepare for the possibility of separation" 
                });
                
                // Sixth choice result (moving forward)
                if (path.sixthChoice === 1) {
                    scenes.push({ dialogue: "You're optimistic. You believe in the connection between you and Alex, and you're ready to face whatever challenges come your way.", choice1: "Continue", choice2: "Continue" });
                } else if (path.sixthChoice === 2) {
                    scenes.push({ dialogue: "You prepare yourself for the possibility that things might not work out. It's a hard thought, but one you can't ignore.", choice1: "Continue", choice2: "Continue" });
                }
            }
        }
    }
    
    return scenes;
}

function getPath() {
    let leadershipCount = 0;
    let romanceCount = 0;
    
    playerChoices.forEach(choice => {
        if (choice === 1) leadershipCount++;
        else if (choice === 2) romanceCount++;
    });
    
    return {
        leadershipCount,
        romanceCount,
        firstChoice: playerChoices[0],
        secondChoice: playerChoices[1],
        thirdChoice: playerChoices[2],
        fourthChoice: playerChoices[3],
        fifthChoice: playerChoices[4],
        sixthChoice: playerChoices[5],
        seventhChoice: playerChoices[6]
    };
}

function updateBodyTone(tone) {
    document.body.className = tone + '-tone';
}

// Ending
function endGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ending-screen').style.display = 'block';
    
    const ending = determineEnding();
    document.getElementById('ending-title').textContent = ending.title;
    
    const endingText = document.getElementById('ending-text');
    endingText.innerHTML = '';
    typeText(endingText, ending.text, () => {
            playSound('success');
    });
}

function determineEnding() {
    const path = getPath();
    const characterName = selectedCharacter === 'alex' ? 'Alex' : 'Jordan';
    const otherName = selectedCharacter === 'alex' ? 'Jordan' : 'Alex';
    
    if (path.leadershipCount === 3) {
        return {
            title: "The Dedicated Leader",
            text: `The event was a triumph. ${characterName}'s dedication paid off beautifully. However, in pursuing perfection, ${characterName} and ${otherName} grew apart. The relationship became a casualty of ambition. True leadership isn't just about achieving goals—it's about the people we bring along on the journey.`
        };
    } else if (path.romanceCount === 3) {
        return {
            title: "Matters of the Heart",
            text: `The relationship has blossomed into something beautiful. ${characterName} found in ${otherName} someone truly special. However, the event didn't go as smoothly as it could have. Love was gained, but at the cost of professional fulfillment. The challenge moving forward will be learning to balance both.`
        };
    } else if (path.leadershipCount === 2 && path.romanceCount === 1) {
        return {
            title: "The Balanced Leader",
            text: `Congratulations! A beautiful balance was found. The event was a success, and the relationship with ${otherName} grew stronger through understanding and mutual support. True leadership isn't about choosing between work and love—it's about finding harmony between all aspects of life.`
        };
    } else if (path.romanceCount === 2 && path.leadershipCount === 1) {
        return {
            title: "Love and Growth",
            text: `The relationship has flourished. ${characterName} discovered in ${otherName} a true companion. The event had challenges but worked out in the end. ${characterName} learned valuable lessons about balance, communication, and the importance of being present for the people who matter.`
        };
    } else {
        return {
            title: "A Bittersweet Conclusion",
            text: `The event concluded, but not without challenges. ${characterName} tried to balance everything, but neither the leadership responsibilities nor the relationship received full attention. The relationship survived but feels fragile. This experience taught valuable lessons about clear communication and making difficult choices with intention.`
        };
    }
}

// Utility functions
function showSettings() {
    playSound('click');
    alert('Settings feature coming soon!');
}

function exitGame() {
    playSound('click');
    if (confirm('Are you sure you want to exit?')) {
        window.close();
    }
}

function restartGame() {
    playSound('click');
    location.reload();
}

function showMainMenu() {
    playSound('click');
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ending-screen').style.display = 'none';
    document.getElementById('character-select').style.display = 'none';
    document.body.className = '';
    currentScene = 0;
    playerChoices = [];
    selectedCharacter = 'alex';
}

function playSound(soundType, volume = 0.3) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (soundType === 'click') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (soundType === 'typing') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 400;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } else if (soundType === 'success') {
            const frequencies = [523.25, 659.25, 783.99];
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                const startTime = audioContext.currentTime + (index * 0.1);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });
        }
    } catch (error) {
        console.log('Audio not available');
    }
}
