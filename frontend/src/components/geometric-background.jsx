const GeometricBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Animated squares */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rotate-12 animate-pulse" />
        <div
          className="absolute top-32 right-20 w-16 h-16 bg-secondary/15 rotate-45 animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/10 -rotate-12 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-10 w-12 h-12 bg-primary/20 rotate-45 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-32 right-1/3 w-18 h-18 bg-muted/30 rotate-12 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-20 left-1/2 w-14 h-14 bg-secondary/10 -rotate-45 animate-bounce"
          style={{ animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-10 left-20 w-22 h-22 bg-accent/15 rotate-45 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-10 h-10 bg-primary/15 -rotate-12 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "1s" }}
        />
      </div>
    </div>
  )
}

export default GeometricBackground
