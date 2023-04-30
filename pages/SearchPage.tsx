import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import split from 'just-split';
import { Box, ScrollView, useToast } from 'native-base';
import { useEffect, useState } from 'react';
import ProgressBar from 'react-native-animated-progress';

import { VideoInfo, PressableCard } from '../components';
import { usePlayer, useSource, useSearchList, useConfig } from '../hooks';
import { Favorite, Source } from '../modals';
import { SourceProvider } from '../providers';

const sourceProvider = SourceProvider.getProvider();

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const { concurrencyNumber } = useConfig();
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
      const sourceSplit = split(
        sourceList.filter(id => byId[id].isEnabled === 1),
        parseInt(concurrencyNumber?.value ?? '2', 10)
      );
      for (const sourceIds of sourceSplit) {
        await Promise.all(sourceIds.map(id => loadSearchItemListBySource(byId[id])));
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
    <Box>
      {loading && <ProgressBar indeterminate backgroundColor="#23d3ee" />}
      <ScrollView>
        {searchItemList.map((item, index) => (
          <PressableCard key={index} onPress={() => onFavoriteCardPress(item)}>
            <VideoInfo {...item} />
          </PressableCard>
        ))}
      </ScrollView>
    </Box>
  );
}
