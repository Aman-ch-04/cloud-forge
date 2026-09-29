import React, { useEffect, useState } from "react";

interface Post {
  id: number;
  user: string;
  text: string;
  created_at: string;
  options?: { text: string; response: string }[];
}



const AUTO_MESSAGES: Post[] = [
  {
    id: 1,
    user: "Farmer Friend",
    text: "Good morning! 🌞 I just checked my wheat field. The crops look strong and healthy.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Did you sow good seeds?", response: "Yes, I used certified high-yield wheat seeds 🌾." },
      { text: "Any fertilization done?", response: "I applied humus; it’s better than chemical fertilizer. 🌱" },
    ],
  },
  {
    id: 2,
    user: "Farmer Friend",
    text: "I am planning to sow basmati rice this season. Heard it gives good profit. 💰",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Yes, Basmati rice is good", response: "Exactly! It grows well in our soil type." },
      { text: "Try hybrid seeds too?", response: "Hybrid seeds can give faster growth, but need careful irrigation. 💧" },
    ],
  },
  {
    id: 3,
    user: "Farmer Friend",
    text: "The soil seems a bit dry today. I need to irrigate the maize field.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Use drip irrigation", response: "Yes, drip saves water and feeds crops efficiently. 💦" },
      { text: "Water manually", response: "Manual watering works but consumes more time. ⏱️" },
    ],
  },
  {
    id: 4,
    user: "Farmer Friend",
    text: "I saw some pests in my tomato plants. 🐛",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Spray neem oil", response: "Neem oil works great naturally without chemicals. 🌿" },
      { text: "Use pesticide", response: "Pesticide helps, but must be used carefully. ⚠️" },
    ],
  },
  {
    id: 5,
    user: "Farmer Friend",
    text: "I am covering my wheat fields with straw for winter protection. ❄️",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Good idea!", response: "Yes, it keeps soil warm and prevents frost damage." },
      { text: "Is it necessary?", response: "Absolutely, winter protection improves yield. 🌾" },
    ],
  },
  {
    id: 6,
    user: "Farmer Friend",
    text: "Humus seems to be working better than chemical fertilizers. My plants are greener. 🌱",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Stick with humus", response: "Yes, organic matter keeps soil fertile for long." },
      { text: "Use mix of both", response: "A combination works well but monitor carefully. ⚖️" },
    ],
  },
  {
    id: 7,
    user: "Farmer Friend",
    text: "Pumpkins are growing nicely. 🎃 Planning to harvest soon.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Harvest carefully", response: "Yes, I will avoid bruising the fruits." },
      { text: "Leave them for more days", response: "Waiting a few days will make them sweeter." },
    ],
  },
  {
    id: 8,
    user: "Farmer Friend",
    text: "Banana trees are flowering beautifully. 🌴",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Great! Keep soil moist", response: "Yes, bananas need constant moisture. 💧" },
      { text: "Check for pests", response: "Already monitoring, no pests detected yet. 🐞" },
    ],
  },
  {
    id: 9,
    user: "Farmer Friend",
    text: "Wind is strong today, covering some crops. 💨 Be careful!",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Secure crops", response: "Yes, tied them to stakes to prevent damage." },
      { text: "Let them be", response: "Will monitor closely, hope they survive. 🌱" },
    ],
  },
  {
    id: 10,
    user: "Farmer Friend",
    text: "Weather forecast says rain tomorrow 🌧️. Need to protect my tomato plants.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Cover them with plastic", response: "Yes, prevents waterlogging and rot." },
      { text: "Let them rain", response: "Might be risky, need drainage ready." },
    ],
  },
  {
    id: 11,
    user: "Farmer Friend",
    text: "Low harvest this season. 😔 But I won’t lose hope.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Stay positive!", response: "Yes, next season will be better." },
      { text: "Try crop rotation", response: "Good idea, rotation improves soil fertility. 🌾" },
    ],
  },
  {
    id: 12,
    user: "Farmer Friend",
    text: "I am planning to plant legumes to enrich soil nitrogen. 🌱",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Good choice", response: "Yes, legumes improve soil naturally." },
      { text: "Use fertilizer too", response: "Minimal fertilizer is okay with legumes." },
    ],
  },
  {
    id: 13,
    user: "Farmer Friend",
    text: "I need to prune tomato plants for better yield 🍅.",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Prune carefully", response: "Yes, only remove unnecessary branches." },
      { text: "Leave them", response: "Might affect growth and fruiting." },
    ],
  },
  {
    id: 14,
    user: "Farmer Friend",
    text: "I am checking soil pH before sowing next crop. 🧪",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Good practice", response: "Yes, helps in choosing the right fertilizer." },
      { text: "Is it necessary?", response: "Absolutely, soil pH affects crop growth." },
    ],
  },
  {
    id: 15,
    user: "Farmer Friend",
    text: "Planning to sell surplus crops at the local market. 🏪",
    created_at: new Date().toLocaleTimeString(),
    options: [
      { text: "Check prices", response: "Yes, pricing is important to get profit." },
      { text: "Store a bit for seeds", response: "Good idea, saving seeds for next season." },
    ],
  },
];

let postIdCounter = 100;

const FarmerFriendsAuto: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [waitingForReply, setWaitingForReply] = useState(true); // wait for first reply

  // Add next Farmer Friend message
  const addNextMessage = (index: number) => {
    if (index < AUTO_MESSAGES.length) {
      const newPost = { ...AUTO_MESSAGES[index], id: postIdCounter++ };
      setPosts((prev) => [newPost, ...prev]);
      setCurrentIndex(index + 1);
      setWaitingForReply(true); // wait for user reply
    }
  };

  // Initial message
  useEffect(() => {
    addNextMessage(0);
  }, []);

  const handleOptionClick = (response: string) => {
    const userReply: Post = {
      id: postIdCounter++,
      user: "You",
      text: response,
      created_at: new Date().toLocaleTimeString(),
    };
    setPosts((prev) => [userReply, ...prev]);
    setWaitingForReply(false);

    // Wait 4 seconds, then send next Farmer Friend message
    setTimeout(() => {
      addNextMessage(currentIndex);
    }, 4000);
  };

  return (
    <div style={{ padding: 30, background: "#e8f5e9", minHeight: "100vh" }}>
      <h1 style={{ color: "#1b5e20", marginBottom: 20 }}>👨‍🌾 Farmer Friends</h1>

      {posts.map((post, index) => (
        <div
          key={post.id}
          style={{
            background: post.user === "You" ? "#d0f0c0" : "white",
            padding: 20,
            borderRadius: 15,
            marginBottom: 20,
            width: "60%",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <p>
            <strong>{post.user}</strong> — {post.created_at}
          </p>
          <p style={{ fontSize: "18px", marginTop: 10 }}>{post.text}</p>

          {/* Show options only for the latest Farmer Friend post and when waiting for reply */}
          {post.options &&
            post.user === "Farmer Friend" &&
            index === 0 &&
            waitingForReply && (
              <div
                style={{
                  marginTop: 15,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {post.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt.response)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#2e7d32",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default FarmerFriendsAuto;
