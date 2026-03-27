import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
  loading: boolean;
}

const Loader = ({ loading }: LoaderProps) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo with pulsing and scaling animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                opacity: 1
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src="/logo-devanshi.svg"
                alt="Devanshi Collection Loader"
                className="h-32 w-auto md:h-48"
              />
              
              {/* Outer glowing ring animation */}
              <motion.div
                animate={{
                  scale: [1, 1.4],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              />
            </motion.div>

            {/* Loading text with typewriter effect or simple fade */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="font-display text-xl font-bold tracking-[0.2em] text-primary uppercase">
                DEVANSHI
              </span>
              <span className="font-display text-lg font-medium tracking-widest text-foreground mt-1">
                COLLECTION
              </span>
              
              {/* Animated loading dots */}
              <div className="flex gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
