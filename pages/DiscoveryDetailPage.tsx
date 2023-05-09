import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Image, Column, Text, Heading, ScrollView, Box, useToast, AspectRatio } from 'native-base';
import { useEffect, useState } from 'react';

import { PressableCard, WithLoading } from '../components';
import { useSource, useDiscovery, usePlayer } from '../hooks';
import { Favorite } from '../modals';

export default function DiscoveryDetailPage() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<{ title: string; discoveryItemList: Favorite[] }[]>([]);
  const { byId } = useSource();
  const { discovery } = useDiscovery();
  const toast = useToast();

  const source = byId[discovery!.sourceId];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${source.resourceServerUrl}/api/run/discovery`,
          {
            script: source.discoveryScript,
            input: discovery!.discoveryUrl,
          },
          { timeout: 15000 }
        );
        setGroups(res.data.data);
      } catch {
        toast.show({ description: `${source.name} 加载失败` });
      }
      setLoading(false);
    };

    init();
  }, []);

  return (
    <WithLoading loading={loading}>
      <ScrollView>
        {groups.map((group, index) => (
          <Column key={index}>
            <Heading className="text-gray-800 m-2">{group.title}</Heading>
            <Box className="flex-row flex-wrap justify-around">
              {group.discoveryItemList
                .slice(0, Math.floor(group.discoveryItemList.length / 3) * 3)
                .map((item, index) => (
                  <DiscoveryCard
                    key={index}
                    onlyDiscovery={!source.findSeriesScript}
                    discovery={Favorite.fromMap({ ...item, sourceId: source.id, sourceName: source.name })}
                  />
                ))}
            </Box>
          </Column>
        ))}
      </ScrollView>
    </WithLoading>
  );
}

const DiscoveryCard = ({ discovery, onlyDiscovery }: { discovery: Favorite; onlyDiscovery: boolean }) => {
  const { init: initVideoInfo, setVideoInfo } = usePlayer();

  const navigation = useNavigation<any>();

  const onCardPress = (item: Favorite) => {
    if (onlyDiscovery) {
      navigation.navigate('SearchPage', { keyword: discovery.title });
    } else {
      initVideoInfo();
      setVideoInfo(item);
      navigation.navigate('PlayerPage');
    }
  };

  return (
    <Column className="w-28 my-1">
      <PressableCard onPress={() => onCardPress(discovery)}>
        <AspectRatio ratio={2 / 3}>
          {discovery.image ? (
            <Image
              source={{
                uri: discovery.image,
              }}
              fallbackSource={{
                uri: 'https://cdn.staticaly.com/gh/Humble-Xiang/picx-images@master/geek/15659380625d56518ef0c8b.3nj1v9ieeeu0.webp',
              }}
              alt="image"
            />
          ) : (
            <Image
              source={{
                uri: 'https://cdn.staticaly.com/gh/Humble-Xiang/picx-images@master/geek/15659380625d56518ef0c8b.3nj1v9ieeeu0.webp',
              }}
              alt="image"
            />
          )}
        </AspectRatio>
      </PressableCard>
      <Text noOfLines={1} className="text-gray-800 text-sm font-medium">
        {discovery.title}
      </Text>
    </Column>
  );
};
