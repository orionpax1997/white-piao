import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Box, Icon, Row, IconButton, View, Input, Heading } from 'native-base';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import DiscoveryPage from './DiscoveryPage';
import FavoritesPage from './FavoritesPage';
import SettingsPage from './SettingsPage';

const sceneMap = SceneMap({
  favorite: FavoritesPage,
  discovery: DiscoveryPage,
  settings: SettingsPage,
});

export default function HomePage() {
  const [routes] = useState([
    { key: 'favorite', title: '收藏' },
    { key: 'discovery', title: '发现' },
    { key: 'settings', title: '设置' },
  ]);
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();

  return (
    <>
      <AppBar />
      <TabView
        tabBarPosition="bottom"
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </>
  );
}

const AppBar = () => {
  const [keyword, setKeyword] = useState<string>('');
  const navigation = useNavigation<any>();

  return (
    <Box safeAreaTop className="bg-cyan-600">
      <Row className="pl-5 py-3 justify-between">
        <Row className="items-center">
          <Heading size="sm" className="text-white">
            WhitePiao
          </Heading>
        </Row>
        <Row className="flex-1 pl-5 pr-1 justify-evenly items-center">
          <View className="flex-1">
            <Input
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={() => {
                if (keyword) navigation.navigate('SearchPage', { keyword });
              }}
              placeholder="搜索影视"
              variant="rounded"
              size="xs"
              borderWidth={0}
              className="h-8 bg-cyan-700 text-white"
            />
          </View>
          <IconButton
            icon={<Icon as={MaterialIcons} name="search" size="sm" color="white" />}
            onPress={() => {
              if (keyword) navigation.navigate('SearchPage', { keyword });
            }}
          />
        </Row>
      </Row>
    </Box>
  );
};

const renderTabBar = (props: any) => (
  <Box className="bg-cyan-600">
    <TabBar
      {...props}
      renderIcon={({ route, focused }) => (
        <Icon as={renderIcon(route.key, focused)} className={`${focused ? 'text-pink-800' : 'text-white'} mb-1`} />
      )}
      style={{ backgroundColor: '' }}
      indicatorStyle={{ backgroundColor: '' }}
    />
  </Box>
);

const renderIcon = (key: string, focused: boolean) => {
  if (focused) {
    if (key === 'favorite') {
      return <MaterialIcons name="favorite" />;
    } else if (key === 'discovery') {
      return <Ionicons name="cube" />;
    } else {
      return <Ionicons name="settings" />;
    }
  } else {
    if (key === 'favorite') {
      return <MaterialIcons name="favorite-outline" />;
    } else if (key === 'discovery') {
      return <Ionicons name="cube-outline" />;
    } else {
      return <Ionicons name="settings-outline" />;
    }
  }
};
