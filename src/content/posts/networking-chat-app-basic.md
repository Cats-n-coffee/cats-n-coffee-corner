---
title: 'Learning Networking - Building a Chat App from Scratch'
pubDate: 2024-06-24
description: 'Notes from building a basic chat app from scratch'
author: 'Cats-n-Coffee'
image:
    url: ''
    alt: ''
tags: ["cplusplus", "networking"]
introType: 'learningIntro'
---

Learning about networking has been in the back of my mind for a while, but all my attempts so far have not been memorable enough to use what I have learned (or even explain it). Changing my approach in building projects and learning foreign topics, this project is starting much better.
Let's build a chat app, and do it "from scratch" (because we're here to learn).
Note that half of this post was written way after the project was finished, because life gets in the way at times. Some explanations and break downs are not as detailed as they could've been.

## Changing the Learning Approach

Some time ago, I had looked up socket programming and found a bunch of code examples and articles to implement basic stuff. It's there somewhere on my computer, I remember spending time reading about certain parts, but I still can't explain it or make sense of it. That's because I didn't take the time I should've took to learn *principles* and *concepts*, and went straight to the code. 
Lately, the approach has been to **take time to learn**. First, because that's actually enjoyable, and second, because it's nice to remember things when we spend time on them.
Instead of getting straight to Google and look up "how to use sockets with C++" (which has its place I think), now it's more like "what is a socket in programming". 
So, this started with understanding the concepts, going down some rabbit holes, and eventually ended up writing down the steps needed. (This project started on Windows, continued on Linux, finished on MacOS, it's a long story).

After spending some time reading documentation left and right, and taking time to understand  [what sockets are](https://www.ibm.com/docs/en/i/7.5?topic=programming-how-sockets-work) and read about [TCP/IP](https://www.ibm.com/docs/en/zos/3.1.0?topic=concepts-tcpip), we can start planning and trying things.

## New Challenge

New challenge was taken to use only the `man` pages to complete the simplest version of this project. It was pretty fun, and those pages are very well written and pretty easy to use. 
From the earlier readings about socket concepts, we noted the following steps for the server:
- Create a socket
- Bind the socket to an IP and port
- Listen for incoming connections
- Accept connections
- Read/send messages
- Close the socket

For the client:
- Create a socket
- (Bind is not needed, which I understood later)
- Connect to the server
- Send/Read messages
- Close the socket

There are more steps in between to make something useful, but these are the essential steps.
If we Google for "man pages create socket", we'll see this [result](https://www.man7.org/linux/man-pages/man2/socket.2.html), which has great explanations and links to some next steps as well.

## Starting the Project

Using the man page for creating a socket, we get a starting point, and we'll need this on both the server and client. Note that making a separate client program is not needed, at least for the first steps, but for me it was part of the project. This is done using the `socket()` call, which is probably the simplest function to use of the entire project. The parameters specify the type of the socket we're creating (same [link](https://www.man7.org/linux/man-pages/man2/socket.2.html) as above).

Next, we'll need to bind the newly created socket, so it can be found by other sockets to connect. We'll use the `bind()` function for this, which takes parameters about the socket address. This part was confusing because there are different ways to do this, but after reading the related chapter in The Linux Programming Interface (chapter 59, starting page 1204), there is an old and a new way. We used the old way here because that's where Google and my understanding took me at the time, but we should update this to use `getaddrinfo` as shown [here](https://www.man7.org/linux/man-pages/man3/getaddrinfo.3.html). The old way still works of course and uses function like `inet_aton()`, which we kept here as it makes the code shorter and easier to read (yes, that's a terrible justification).
In this project, only the server will need to bind.

Once we have a bound socket, we can starting listening for incoming connections. As mentioned in the [documentation](https://www.man7.org/linux/man-pages/man2/listen.2.html), calling `listen()` will make the socket *passive*, which means we'll also need to call `accept()` after for the socket to become *active*. 
`listen()` takes only two arguments, the second being the size of the queue of pending connections. 
In order to do anything with the incoming connections, we'll need to `accept()` them. By doing this, a new socket will be created as explained on the [page](https://www.man7.org/linux/man-pages/man2/accept.2.html) and doesn't affect the original socket accepting connections. 

At this point we can look at the client. It needs to call `socket()` then [`connect()`](https://www.man7.org/linux/man-pages/man2/connect.2.html) with the address of the server. If the connection succeeds, the client sends a message using `send()`.

The server can receive a message with [`recv()`](https://www.man7.org/linux/man-pages/man2/recv.2.html) and print it.

At this point we have a very simple server-client "chat system", where the server listens and accepts connections, but only reads one message before closing. The client is similar, connecting to the server and sending one message before closing.

Next, let's allow multiple messages to be sent to the server.

## Going the Wrong Way

There was a pretty simple way to actually deal with this, but no project is worth the learning experience without a good detour.
Doing some Googling we can find a lot of mentions of `poll()`. The [Man page](https://man7.org/linux/man-pages/man2/poll.2.html) mentions "it waits for one of a set of file descriptors to become ready to perform I/O.". That's straight forward to understand, but brought back to the context of the chat app where we want to receive multiple messages it was confusing. 

Long story short (and also because I can't quite recall my thought process at the time), we went down the path of using two threads: one for accepting connections, and one for receiving messages. That did not work. The accept handler was pushing each connection to a vector, which the receive handler was looping over but `poll()` was also in there. Moving on.

## Getting it Working

At this point it's probably best to go back to the last working state of the project, so we can remove all about threads and `poll`, and start that part over.
After looking at Beej's guide, and reading a couple chapters in the Linux book, it looks like `poll` needs to (or can?) be used for listening to *all* the events. Even those on the listening socket.

We'll add our listening socket to our vector of connections. It will be the first connection in the vector, that way we know it's at index zero.
As mentioned in the `poll()` documentation linked above, `poll` "waits for some event on a file descriptor", which means it can also catch the incoming connections on the listening socket. 
And with this information, it becomes easier to see what we need to do:
If an event is coming in, is this event on the listening socket?
- Yes: `accept` the connection and push to our vector of connections. 
- No: Receive the message with `recv`, and if needed `send` the message to all the other connections

`poll` will be in an infinite loop in order to keep calling it and use its returned value. And since we need to identify our listening socket in order to accept connection OR receive incoming messages, we'll also need to loop over our vector of connections inside that infinite loop.
Since we're sending the incoming message to all other clients, it's also good to remove disconnected clients, which we can do at the end of our infinite loop if we received a message with a length of zero from that client (this might not be the way to handle this, but it's been working).

That's about it for the server, we can improve our client so it can send multiple message.

Our client(s) need(s) to be able to send and receive messages. Both of those hint that we'd probably need infinite loops, but we can only have one infinite loop in our `main` function or it  would block any code below (we can of course have more than one loop in `main`, but for this purpose, one loop would block the rest of the code). We can use threads to have both loops running at the same time. 
One thread will handle receiving with `recv` again, and the second will handle sending with `send`. We can take user input from `stdin`, and probably check for the length before sending since the buffer on both client and server can only contain 100 `char`. But this brings another point and something missing from this project: a protocol. Which will make for another project (or extend this one). 

That's it for the client part. We now have a very simple chat app!

As mentioned above, the next thing to add would probably be a protocol. There are of course many other parts that can be changed and improved, but this makes for a decent start and nice learning project.

Final code can be found [on Github](https://github.com/Cats-n-coffee/LetsChat).
## Random Things Learned

- Sockets are used for everything as soon as there is a need for communication. They allow inter-process communication. Examples: an IDE receiving autocomplete suggestions, request a file from a remote server, ... . 
  Slide 2 on [this presentation](https://www.cs.cornell.edu/courses/cs4450/2021sp/lecture11-socket-programming.pdf), [Beej's guide](https://beej.us/guide/bgnet/html/#what-is-a-socket) and [this doc](https://www.ibm.com/docs/en/i/7.5?topic=communications-socket-programming) make it more obvious.
- A socket has nothing to do with a port (I got confused too), but a socket can be bound to a port in order to be found by other sockets to communicate. This can be done explicitly in the code, or done by the kernel. 
  After building this project and reading multiple sources, a socket seem to be an interface over a file descriptor, that can be exposed to the outside if bound to a port.
- There are different types of sockets, we use TCP in this project. Many articles explain the differences between socket types and [Wikipedia](https://en.wikipedia.org/wiki/Network_socket) can be a good start. Many details and great explanations are provided in *The Linux Programming Interface* book by Michael Kerrisk, probably a must have.
