import uvicorn
import os
##if __name__ == "__main__":
  ##  uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # 10000 é o valor padrão local
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)


