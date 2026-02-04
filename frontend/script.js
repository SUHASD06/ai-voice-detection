const fileInput = document.getElementById("audioFile");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("result");

analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload an MP3 file");
        return;
    }

    // Convert MP3 to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
        // Remove data:audio/mp3;base64,
        const base64Audio = reader.result.split(",")[1];

        try {
            const response = await fetch("http://127.0.0.1:8000/detect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    audio_base64: base64Audio
                })
            });

            const data = await response.json();

            resultBox.innerHTML = `
                <h2>${data.classification}</h2>
                <p><b>Confidence:</b> ${(data.confidence * 100).toFixed(2)}%</p>
                <p>${data.explanation}</p>
            `;

        } catch (error) {
            resultBox.innerHTML = `<p style="color:red;">Error analyzing audio</p>`;
        }
    };
});

