import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { ScrollView, useToast } from 'native-base';
import { useEffect, useState } from 'react';

import { WithLoading, VideoInfo, PressableCard } from '../components';
import { usePlayer, useSource } from '../hooks';
import { Favorite, Source } from '../modals';
import { SourceProvider } from '../providers';

const sourceProvider = SourceProvider.getProvider();

export default function SearchPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);
  const [searchItemList, setSearchItemList] = useState<Favorite[]>([]);
  const { list, byId, setById } = useSource();
  const { init, setVideoInfo } = usePlayer();
  const toast = useToast();

  const { keyword } = route.params;

  useEffect(() => {
    let tempList = searchItemList;
    let tempIndex = 0;

    const loadSearchItemListBySource = async (source: Source) => {
      try {
        const res = await axios.post(
          `${source.resourceServerUrl}/api/run/search`,
          {
            script: source.searchScript,
            input: keyword,
          },
          { timeout: 15000 }
        );
        tempList = [
          ...tempList,
          ...res.data.data.map((item: Favorite) => {
            return { ...item, sourceId: source.id, sourceName: source.name };
          }),
        ];
        setSearchItemList(tempList);
        source.searchTime = res.data.time;
        sourceProvider.update(source);
        setById({ ...byId, [source.id!]: source });
      } catch {
        toast.show({ description: `${source.name} 搜索失败` });
      }
      tempIndex += 1;
      if (tempIndex === list.filter(id => byId[id].isEnabled === 1).length) {
        setLoading(false);
      }
    };

    const loadSearchItemList = async () => {
      setLoading(true);
      list
        .filter(id => byId[id].isEnabled === 1)
        .map(id => byId[id])
        .forEach(source => loadSearchItemListBySource(source));
    };
    if (searchItemList.length === 0) {
      loadSearchItemList();
    }
  }, [searchItemList]);

  return (
    <WithLoading loading={loading}>
      <ScrollView>
        {searchItemList.map((item, index) => (
          <PressableCard
            key={index}
            onPress={() => {
              init();
              setVideoInfo(item);
              navigation.navigate('PlayerPage');
            }}>
            <VideoInfo {...item} />
          </PressableCard>
        ))}
      </ScrollView>
    </WithLoading>
  );
}
