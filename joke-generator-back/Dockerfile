# Use the official Go image as a base image
FROM golang:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the local code into the container
COPY . .

# Download and install any dependencies
RUN go mod download

# Build the Go application
RUN go build -o joke-generator-back

# Expose the port the application runs on
EXPOSE 8080

# Command to run the executable
CMD ["./joke-generator-back"]
