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
  const { list: sourceList, byId, setById } = useSource();
  const { init: initVideoInfo, setVideoInfo } = usePlayer();
  const { list: searchItemList, init: initSearchList, concat } = useSearchList();
  const toast = useToast();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { keyword } = route.params;

  useEffect(() => {
    /**
     * 对特定来源进行搜索
     */
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
        // 搜索结果合并
        concat(
          res.data.data.map((item: Favorite) => {
            return { ...item, sourceId: source.id, sourceName: source.name };
          })
        );
        // 更新来源搜索时间
        source.searchTime = res.data.time;
        setById({ ...byId, [source.id!]: source });
        sourceProvider.update(source);
      } catch {
        toast.show({ description: `${source.name} 搜索失败` });
      }
    };

    const init = async () => {
      initSearchList();
      setLoading(true);
      for (const id of sourceList.filter(id => byId[id].isEnabled === 1)) {
        await loadSearchItemListBySource(byId[id]);
      }
      setLoading(false);
    };

    init();
  }, []);

  const onFavoriteCardPress = (item: Favorite) => {
    initVideoInfo();
    setVideoInfo(item);
    navigation.navigate('PlayerPage');
  };

  return (
    <WithLoading loading={loading}>
      <ScrollView>
        {searchItemList.map((item, index) => (
          <PressableCard key={index} onPress={() => onFavoriteCardPress(item)}>
            <VideoInfo {...item} />
          </PressableCard>
        ))}
      </ScrollView>
    </WithLoading>
  );
}
