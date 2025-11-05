import uvicorn
import multiprocessing


if __name__ == "__main__":
    multiprocessing.freeze_support()
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
