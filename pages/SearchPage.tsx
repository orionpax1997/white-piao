import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { ScrollView, useToast } from 'native-base';
import { useEffect, useState } from 'react';

import { WithLoading, VideoInfo, PressableCard } from '../components';
import { usePlayer, useSource, useSearchList } from '../hooks';
import { Favorite, Source } from '../modals';
import { SourceProvider } from '../providers';

const sourceProvider = SourceProvider.getProvider();

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const { list: searchItemList, init: initSearchList, concat } = useSearchList();
  const { list: sourceList, byId, setById } = useSource();
  const { init: initVideoInfo, setVideoInfo } = usePlayer();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();

  const { keyword } = route.params;

  useEffect(() => {
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
        concat(
          res.data.data.map((item: Favorite) => {
            return { ...item, sourceId: source.id, sourceName: source.name };
          })
        );
        source.searchTime = res.data.time;
        sourceProvider.update(source);
        setById({ ...byId, [source.id!]: source });
      } catch {
        toast.show({ description: `${source.name} 搜索失败` });
      }
    };

    const loadSearchItemList = async () => {
      initSearchList();
      setLoading(true);
      await Promise.all(
        sourceList
          .filter(id => byId[id].isEnabled === 1)
          .map(id => byId[id])
          .map(async source => loadSearchItemListBySource(source))
      );
      setLoading(false);
    };

    loadSearchItemList();
  }, []);

  return (
    <WithLoading loading={loading}>
      <ScrollView>
        {searchItemList.map((item, index) => (
          <PressableCard
            key={index}
            onPress={() => {
              initVideoInfo();
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
