import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { log } from "console";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const port = 4000;
const secretKey = "fhadsjkfhasdugfasdgfuasdg";

const app = express();
const server = new createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) return next(new Error(err));
        const token = socket.request.cookies.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        jwt.verify(token, secretKey);
        next();
    });
});

io.on("connection", (socket) => {
    log("User Connected", socket.id);

    socket.on("message", ({ message, room }) => {
        log({ room, message });
        socket.to(room).emit("receive-message", message);
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        log("User Joined Room", room);
    });

    socket.on("disconnect", () => {
        log("User Disconnected", socket.id);
    });
});

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/login", (req, res) => {
    const token = jwt.sign(
        {
            _id: "asdfasdfasdfasdfadfs",
        },
        secretKey
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }).json({
        message: "Login Success.",
    });
});

server.listen(port, () => {
    console.log(`Server app listening on port ${port}`);
});
