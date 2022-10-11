import { Pressable, Box } from 'native-base';
import { FC, ReactNode } from 'react';

export const PressableCard: FC<{ children: ReactNode; onPress: () => void }> = ({ children, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      {({ isPressed }) => {
        return (
          <Box
            className={`m-1 rounded-lg overflow-hidden border border-gray-200 ${
              isPressed ? 'bg-gray-200' : 'bg-gray-100'
            }`}
            shadow={3}
            style={{
              transform: [
                {
                  scale: isPressed ? 0.96 : 1,
                },
              ],
            }}>
            {children}
          </Box>
        );
      }}
    </Pressable>
  );
};
