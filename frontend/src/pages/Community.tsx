import "./Community.css";

function Community() {
    return (
        <div className="community-page">

            <h1>👥 Community</h1>

            <div className="community-grid">

                <div className="community-card">
                    <h2>🌍 Official Website</h2>
                    <a href="https://polishpepe.io" target="_blank">
                        https://polishpepe.io
                    </a>
                </div>

                <div className="community-card">
                    <h2>🐦 X</h2>
                    <a href="https://x.com/PolishPepePL" target="_blank">
                        @PolishPepePL
                    </a>
                </div>

                <div className="community-card">
                    <h2>💬 Discord</h2>
                    <a href="https://discord.gg/JwnVbqq7jh" target="_blank">
                        Join Server
                    </a>
                </div>

                <div className="community-card">
                    <h2>📢 Telegram</h2>
                    <a href="https://t.me/PolishPepePL" target="_blank">
                        Join Telegram
                    </a>
                </div>

            </div>

        </div>
    );
}

export default Community;