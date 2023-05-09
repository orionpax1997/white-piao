import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import groupBy from 'just-group-by';
import map from 'just-map-object';
import { ScrollView, useToast, Badge, Spinner } from 'native-base';
import { useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';

import { WithLoading, PressableCard, VideoInfo } from '../components';
import { EPISODE_CONSTANTS, EPISODE_SOURCE_CONSTANTS, FAVORITE_CONSTANTS } from '../constants';
import { useFavorite, usePlayer, useSource } from '../hooks';
import { Episode, EpisodeSource, Favorite } from '../modals';
import { FavoriteProvider, EpisodeProvider, EpisodeSourceProvider } from '../providers';

const favoriteProvider = FavoriteProvider.getProvider();
const episodeProvider = EpisodeProvider.getProvider();
const episodeSourceProvider = EpisodeSourceProvider.getProvider();

export default function FavoritesPage() {
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const {
    list,
    byId,
    episodesById,
    episodeSourcesById,
    episodeCountById,
    setById,
    setList,
    setEpisodesById,
    setEpisodeSourcesById,
    setEpisodeCountById,
  } = useFavorite();
  const { byId: sourceById } = useSource();
  const { setVideoInfo, setNeedReload, setHistoryStatus, setFavorite, setEpisodeSources, setEpisodesBySourceIndex } =
    usePlayer();
  const toast = useToast();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const favoriteList = await favoriteProvider.read();
      const episodeList = await episodeProvider.read();
      const episodeSourceList = await episodeSourceProvider.read();
      const tempById = {
        ...favoriteList.reduce((byId, favorite) => {
          byId[favorite[FAVORITE_CONSTANTS.IDENTIFIER]] = Favorite.fromMap(favorite);
          return byId;
        }, {}),
      };
      setById(tempById);
      setList(favoriteList.map(favorite => favorite[FAVORITE_CONSTANTS.IDENTIFIER]));
      setEpisodeSourcesById(
        groupBy(
          episodeSourceList.map(episodeSource => EpisodeSource.fromMap(episodeSource)),
          episodeSource => episodeSource.favoriteId!
        )
      );
      const episodesGroup = map(
        groupBy(
          episodeList.map(episode => Episode.fromMap(episode)),
          episode => episode.favoriteId!
        ),
        (_, list) => groupBy(list, episode => episode.sourceIndex)
      );
      setEpisodesById(episodesGroup);
      setEpisodeCountById(map(episodesGroup, (key, value) => value[tempById[key].currEpisodeSource].length));
      setLoading(false);
    };

    init();
  }, []);

  /**
   * 更新收藏
   */
  const upgradeFavorite = async (favorite: Favorite) => {
    try {
      const source = sourceById[favorite.sourceId];
      const res = await axios.post(
        `${source.resourceServerUrl}/api/run/findSeries`,
        {
          script: source.findSeriesScript,
          input: favorite.seriesUrl,
        },
        { timeout: 10000 }
      );

      // 更新来源状态
      const tempEpisodeSourcesById: { [id: number]: EpisodeSource[] } = {
        ...episodeSourcesById,
        [favorite.id!]: res.data.data.map((item: any, index: number) => {
          return EpisodeSource.fromMap({ title: item.title, index, favoriteId: favorite.id });
        }),
      };
      setEpisodeSourcesById(tempEpisodeSourcesById);

      // 更新剧集状态
      const episodeList: Episode[] = res.data.data.reduce((list: any[], cur: any, sourceIndex: number) => {
        list = [
          ...list,
          ...cur.episodeList.map((item: any, index: number) => {
            return Episode.fromMap({ ...item, index, favoriteId: favorite.id, sourceIndex });
          }),
        ];
        return list;
      }, []);
      const tempEpisodesById = {
        ...episodesById,
        [favorite.id!]: groupBy(episodeList, episode => episode.sourceIndex),
      };
      setEpisodesById(tempEpisodesById);

      // 更新收藏项状态
      const upgrade = Favorite.fromMap({
        ...favorite.toMap(),
        episodeUpdateTime: new Date().toISOString(),
        episodeUpdateFlag:
          tempEpisodesById[favorite.id!][favorite.currEpisodeSource].length > episodeCountById[favorite.id!] ? 1 : 0,
      });
      setById({ ...byId, [favorite.id!]: upgrade });
      setEpisodeCountById({
        ...episodeCountById,
        [favorite.id!]: tempEpisodesById[favorite.id!][favorite.currEpisodeSource].length,
      });

      // 数据持久化
      favoriteProvider.update(upgrade);
      await episodeSourceProvider.delete(`${EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [favorite.id!]);
      tempEpisodeSourcesById[favorite.id!].forEach(source => episodeSourceProvider.create(source));
      await episodeProvider.delete(`${EPISODE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [favorite.id!]);
      episodeList.forEach(episode => episodeProvider.create(episode));
    } catch {
      toast.show({ description: `${favorite.title} 更新失败` });
    }
  };

  const onFavoriteRefresh = () => {
    setUpgrading(true);
    setEpisodesById({});
    setEpisodeSourcesById({});
    list.forEach(id => upgradeFavorite(byId[id]));
    setUpgrading(false);
  };

  const onFavoritePress = (id: number) => {
    if (episodesById[id] && episodeSourcesById[id]) {
      setNeedReload(true);
      setFavorite(byId[id]);
      setVideoInfo(byId[id]);
      setHistoryStatus(byId[id]);
      setEpisodesBySourceIndex(episodesById[id]);
      setEpisodeSources(episodeSourcesById[id]);
      navigation.navigate('PlayerPage');
    }
  };

  return (
    <WithLoading loading={loading}>
      <ScrollView refreshControl={<RefreshControl refreshing={upgrading} onRefresh={onFavoriteRefresh} />}>
        {list.length > 0 &&
          list.map(
            id =>
              byId[id] && (
                <PressableCard key={id} onPress={() => onFavoritePress(id)}>
                  <>
                    <VideoInfo {...byId[id]} />
                    {episodesById[id] && episodeSourcesById[id] ? (
                      <>
                        {episodeCountById[id] > byId[id].currEpisode + 1 && (
                          <Badge
                            className={`absolute w-10 right-2 top-2 text-white ${
                              byId[id].episodeUpdateFlag === 1 ? 'bg-pink-800' : 'bg-gray-400'
                            }`}
                            rounded="full"
                            variant="solid">
                            {episodeCountById[id] - byId[id].currEpisode - 1}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Spinner className="absolute w-10 right-2 top-2 " color="pink.800" />
                    )}
                  </>
                </PressableCard>
              )
          )}
      </ScrollView>
    </WithLoading>
  );
}
