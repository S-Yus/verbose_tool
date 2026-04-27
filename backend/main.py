from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import time
from collections import defaultdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://verbose-tool.vercel.app",
        "https://冗長.com",
        "https://www.冗長.com",
        "https://xn--e7qs86n.com",
        "https://www.xn--e7qs86n.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()

# IPごとのレート制限: 1分間に5回まで
RATE_LIMIT = 5
RATE_WINDOW = 60
ip_requests: dict[str, list[float]] = defaultdict(list)

MAX_INPUT_LENGTH = 500


class VerboseRequest(BaseModel):
    text: str
    level: int  # 1-10


LEVEL_DESCRIPTIONS = {
    1: "少し丁寧な言い回しにする程度",
    2: "やや回りくどく、礼儀正しくする",
    3: "説明を加えながら丁寧に述べる",
    4: "かなり回りくどく、補足説明を多用する",
    5: "官僚的な文体で、定義や前置きを挟みながら述べる",
    6: "学術論文風に、引用や注釈を示唆しながら述べる",
    7: "哲学的考察を交えながら極めて冗長に述べる",
    8: "存在論的問いを含め、読者が迷子になるレベルで冗長にする",
    9: "一文が段落になり、段落がページになるような超冗長文にする",
    10: "もはや元の意味が原形をとどめているか怪しいレベルで、宇宙的視点や歴史的経緯を織り交ぜながら限界まで冗長にする",
}


@app.post("/api/verbose")
async def make_verbose(req: VerboseRequest, request: Request):
    # 入力文字数チェック
    if len(req.text) > MAX_INPUT_LENGTH:
        raise HTTPException(status_code=400, detail=f"入力は{MAX_INPUT_LENGTH}文字以内にしてください。")

    # IPレート制限
    ip = request.client.host
    now = time.time()
    timestamps = ip_requests[ip]
    ip_requests[ip] = [t for t in timestamps if now - t < RATE_WINDOW]
    if len(ip_requests[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="リクエストが多すぎます。1分後に試してください。")
    ip_requests[ip].append(now)

    description = LEVEL_DESCRIPTIONS.get(req.level, LEVEL_DESCRIPTIONS[5])

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=(
            "あなたは文章を無駄に冗長にする専門家です。"
            "入力された文章を指定されたレベルで冗長に書き直してください。"
            "意味は変えず、ただ無駄に長くしてください。"
            "書き直した文章のみを返してください。説明や前置きは不要です。"
        ),
        messages=[
            {
                "role": "user",
                "content": f"冗長レベル{req.level}/10（{description}）で書き直してください:\n\n{req.text}",
            }
        ],
    )

    return {"result": message.content[0].text}
