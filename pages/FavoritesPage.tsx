import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import groupBy from 'just-group-by';
import map from 'just-map-values';
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
  const navigation = useNavigation<any>();
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
  const { setVideoInfo, setHistoryStatus, setFavorite, setEpisodes, setEpisodeSources } = usePlayer();
  const { byId: sourceById } = useSource();
  const toast = useToast();
  let tempById: { [id: number]: Favorite } = {};
  let tempEpisodesById: { [id: number]: Episode[] } = {};
  let tempEpisodeSourcesById: { [id: number]: EpisodeSource[] } = {};
  let tempEpisodeCountById: { [id: number]: number } = {};

  useEffect(() => {
    if (list.length === 0) {
      loadFavorite();
    }
  }, []);

  /**
   * 加载资源
   */
  const loadFavorite = async () => {
    setLoading(true);
    const favoriteList = await favoriteProvider.read();
    const episodeList = await episodeProvider.read();
    const episodeSourceList = await episodeSourceProvider.read();
    setById({
      ...favoriteList.reduce((byId, favorite) => {
        byId[favorite[FAVORITE_CONSTANTS.IDENTIFIER]] = Favorite.fromMap(favorite);
        return byId;
      }, {}),
    });
    setList(favoriteList.map(favorite => favorite[FAVORITE_CONSTANTS.IDENTIFIER]));
    const groupByFavoriteId = groupBy(
      episodeList.map(episode => Episode.fromMap(episode)),
      episode => episode.favoriteId!
    );
    setEpisodesById(groupByFavoriteId);
    setEpisodeCountById(map(groupByFavoriteId, list => list.length));
    setEpisodeSourcesById(
      groupBy(
        episodeSourceList.map(episodeSource => EpisodeSource.fromMap(episodeSource)),
        episodeSource => episodeSource.favoriteId!
      )
    );
    setLoading(false);
  };

  /**
   * 更新全部收藏
   */
  const upgradeFavorites = async () => {
    setUpgrading(true);
    setEpisodesById({});
    setEpisodeSourcesById({});
    tempEpisodesById = {};
    tempEpisodeSourcesById = {};
    tempById = byId;
    tempEpisodeCountById = episodeCountById;
    list.forEach(id => upgradeFavorite(byId[id]));
    setUpgrading(false);
  };

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
      tempEpisodeSourcesById = {
        ...tempEpisodeSourcesById,
        [favorite.id!]: res.data.data.map((item: any, index: number) => {
          return { title: item.title, index };
        }),
      };
      setEpisodeSourcesById(tempEpisodeSourcesById);
      const episodeList = res.data.data[favorite.currEpisodeSource].episodeList;
      tempEpisodesById = {
        ...tempEpisodesById,
        [favorite.id!]: episodeList.map((item: any, index: number) => {
          return { ...item, index };
        }),
      };
      setEpisodesById(tempEpisodesById);
      const upgrade = Favorite.fromMap({
        ...favorite.toMap(),
        episodeUpdateTime: new Date().toISOString(),
        episodeUpdateFlag: tempEpisodesById[favorite.id!].length > episodeCountById[favorite.id!] ? 1 : 0,
      });
      tempById = { ...tempById, [favorite.id!]: upgrade };
      setById(tempById);
      tempEpisodeCountById = { ...tempEpisodeCountById, [favorite.id!]: tempEpisodesById[favorite.id!].length };
      setEpisodeCountById(tempEpisodeCountById);
      await favoriteProvider.update(upgrade);
      await episodeProvider.delete(`${EPISODE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [favorite.id!]);
      await episodeSourceProvider.delete(`${EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [favorite.id!]);
      tempEpisodeSourcesById[favorite.id!].forEach(source =>
        episodeSourceProvider.create(EpisodeSource.fromMap({ ...source, favoriteId: favorite.id }))
      );
      tempEpisodesById[favorite.id!].forEach(episode =>
        episodeProvider.create(Episode.fromMap({ ...episode, favoriteId: favorite.id }))
      );
    } catch {
      toast.show({ description: `${favorite.title} 更新失败` });
    }
  };

  return (
    <WithLoading loading={loading}>
      <ScrollView refreshControl={<RefreshControl refreshing={upgrading} onRefresh={upgradeFavorites} />}>
        {list.length > 0 &&
          list.map(
            id =>
              byId[id] && (
                <PressableCard
                  key={id}
                  onPress={() => {
                    if (episodesById[id] && episodeSourcesById[id]) {
                      setFavorite(byId[id]);
                      setVideoInfo(byId[id]);
                      setHistoryStatus(byId[id]);
                      setEpisodes(episodesById[id]);
                      setEpisodeSources(episodeSourcesById[id]);
                      navigation.navigate('PlayerPage');
                    }
                  }}>
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
