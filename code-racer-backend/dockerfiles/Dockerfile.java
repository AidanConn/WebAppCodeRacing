FROM openjdk:17-jdk-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache bash
CMD ["sh", "-c", "for file in *.java; do javac $file && java ${file%.java}; break; done"]
