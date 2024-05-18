import express from "express";
import WebSocket from 'ws';
import { createClient } from "redis";
import cluster from "cluster";
import os from "os"

const PORT = 3000;
const totalCPUs = os.cpus().length;
const NUM_WORKERS = totalCPUs - 2

const startServerNode = () => {
    const app = express();
    app.use(express.json());

    const client = createClient();
    client.on('error', (err) => {
        console.error("Redis Error:", err)
    })

    app.get("/", (req, res) => {
        const newSocket = new WebSocket('ws://localhost:3000');
        res.json("Hello")
    })

    app.post("/submit_code", async (req, res) => {
        const problem_id = req.body.problem_id;
        const language = req.body.language;
        const code = req.body.code;
        try {
            client.lPush("problems", JSON.stringify({ problem_id, language, code }))
            res.status(200).send("Stored data")
        } catch (err) {
            console.error("Redis Error:", err)
            res.status(500).send("Failed to store data")
        }
        const topic = String(problem_id)
        client.publish(topic, "Problem added to queue...")
    })
    client.connect()

    const server = app.listen(PORT, () => {
        console.log("Server started at PORT: http://localhost:" + PORT)
    })

    const wss = new WebSocket.WebSocketServer({ server: server })

    wss.on("connection", (ws) => {
        console.log("Connected a new client")
        ws.on('status', (data) => {
            ws.send("Status: Completed")
        });
    })
}

const startWorkerNode = async () => {
    console.log("Worker initialized with PID:", process.pid)

    const client = createClient()
    try {
        await client.connect()
        while (true) {
            const code_data: { key: string, element: string } | null = await client.brPop("problems", 0)
            if (code_data != null) {
                const data = JSON.parse(code_data.element)
                client.publish(data.problem_id.toString(), "Worker has picked up the problem")
                await new Promise(resolve => setTimeout(resolve, Math.random() * 10000))
                client.publish(data.problem_id.toString(), "Worker has executed the problem")
            }
        }
    } catch (err) {
        console.error("Redis Error:", err)
    }
}

if (cluster.isPrimary) {
    const master = cluster.fork()
    master.send({ task: "server_node" })

    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = cluster.fork()
        worker.send({ task: "worker_node" })
    }

} else {
    process.on("message", (message: { task: string }) => {
        if (message.task === "server_node")
            startServerNode()
        else if (message.task === "worker_node")
            startWorkerNode()
    })
}

