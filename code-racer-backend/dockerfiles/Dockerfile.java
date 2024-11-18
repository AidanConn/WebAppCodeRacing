FROM openjdk:17-jdk
WORKDIR /usr/src/app
CMD ["sh", "-c", "for file in *.java; do javac $file && java ${file%.java}; break; done"]
