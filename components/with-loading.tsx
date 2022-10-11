import { View, Spinner } from 'native-base';
import { FC, ReactNode } from 'react';

export const WithLoading: FC<{ children: ReactNode; loading: boolean; placement?: 'center' | 'top' | 'bottom' }> = ({
  children,
  loading,
  placement = 'center',
}) => {
  return (
    <>
      {children}
      {loading && placement === 'center' && (
        <View className="absolute w-full h-full items-center justify-center">
          <Spinner size="lg" />
        </View>
      )}
    </>
  );
};
