import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ResizeMode } from 'expo-av';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { lockAsync, OrientationLock } from 'expo-screen-orientation';
import { setStatusBarHidden, setStatusBarStyle, setStatusBarBackgroundColor } from 'expo-status-bar';
import VideoPlayer from 'expo-video-player';
import { openBrowserAsync } from 'expo-web-browser';
import {
  Row,
  Skeleton,
  Spinner,
  Spacer,
  Text,
  Menu,
  Pressable,
  Icon,
  IconButton,
  Button,
  ScrollView,
  View,
  Center,
  Box,
  ZStack,
  useToast,
} from 'native-base';
import { useEffect, useState, useRef } from 'react';
import { Dimensions } from 'react-native';

import { VideoInfo } from '../components';
import { EPISODE_CONSTANTS, EPISODE_SOURCE_CONSTANTS } from '../constants';
import { HistoryStatus, useFavorite, usePlayer, useSource } from '../hooks';
import { Episode, EpisodeSource, Favorite } from '../modals';
import { FavoriteProvider, EpisodeProvider, EpisodeSourceProvider } from '../providers';

const favoriteProvider = FavoriteProvider.getProvider();
const episodeProvider = EpisodeProvider.getProvider();
const episodeSourceProvider = EpisodeSourceProvider.getProvider();

export default function PlayerPage() {
  const {
    streamUrl,
    videoInfo,
    historyStatus,
    favorite,
    episodeSources,
    episodes,
    setStreamUrl,
    setEpisodes,
    setEpisodeSources,
    setHistoryStatus,
    setFavorite,
  } = usePlayer();
  const {
    list: favoriteList,
    byId: favoriteById,
    episodesById,
    episodeSourcesById,
    episodeCountById,
    setList: setFavoriteList,
    setById: setFavoriteById,
    setEpisodesById,
    setEpisodeSourcesById,
    setEpisodeCountById,
  } = useFavorite();
  const { byId } = useSource();
  const [inFullscreen, setInFullsreen] = useState(false);
  const refVideo = useRef<any>(null);
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [favoriting, setFavoriting] = useState(false);

  const source = byId[videoInfo.sourceId];

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      setStatusBarStyle('dark');
      setStatusBarBackgroundColor('#0891b2', false);
      await updateFavoriteHistoryStatus(historyStatus);
    });

    return unsubscribe;
  }, [favorite, historyStatus]);

  useEffect(() => {
    activateKeepAwake();

    return () => {
      deactivateKeepAwake();
    };
  }, []);

  /**
   * 初始化
   */
  const init = async () => {
    setStreamUrl(null);
    let playPageUrl;
    setStatusBarStyle('light');
    setStatusBarBackgroundColor('black', false);
    if (favorite != null) {
      playPageUrl = episodes[historyStatus.currEpisode].playPageUrl;
    } else {
      playPageUrl = await loadEpisodes();
    }
    if (playPageUrl !== '') {
      loadStreamUrl(playPageUrl);
    }
  };

  /**
   * 加载目录
   * @returns 播放页地址
   */
  const loadEpisodes = async (index?: number): Promise<string> => {
    try {
      const res = await axios.post(
        `${source.resourceServerUrl}/api/run/findSeries`,
        {
          script: source.findSeriesScript,
          input: videoInfo.seriesUrl,
        },
        { timeout: 10000 }
      );
      setEpisodeSources(
        res.data.data.map((item: any, index: number) => {
          return { title: item.title, index };
        })
      );
      const episodeList = res.data.data[index ?? historyStatus.currEpisodeSource].episodeList;
      setEpisodes(
        episodeList.map((item: any, index: number) => {
          return { ...item, index };
        })
      );
      const currEpisode =
        historyStatus.currEpisode <= episodeList.length ? historyStatus.currEpisode : episodeList.length;
      return episodeList[currEpisode].playPageUrl;
    } catch {
      toast.show({ description: '目录获取失败' });
      return '';
    }
  };

  /**
   * 加载视频流
   * @param playPageUrl 播放页地址
   */
  const loadStreamUrl = async (playPageUrl: string) => {
    try {
      const res = await axios.post(`${source.resourceServerUrl}/api/run/findStream`, {
        script: source.findStreamScript,
        input: playPageUrl,
      });
      setStreamUrl(res.data.data);
    } catch {
      toast.show({ description: '视频流获取失败' });
    }
  };

  /**
   * 换集
   */
  const onEpisodeChange = async (index: number) => {
    setStreamUrl(null);
    setHistoryStatus({ ...historyStatus, currEpisode: index });
    loadStreamUrl(episodes[index].playPageUrl);
    updateFavoriteHistoryStatus({ ...historyStatus, currEpisode: index });
  };

  /**
   * 收藏
   */
  const onFavorite = async () => {
    setFavoriting(true);
    const now = new Date().toISOString();
    const favorite = await favoriteProvider.create(
      Favorite.fromMap({
        ...videoInfo,
        ...historyStatus,
        createTime: now,
        episodeUpdateTime: now,
        episodeUpdateFlag: 0,
      })
    );
    setFavorite(favorite);
    setFavoriteList([...favoriteList, favorite.id!]);
    setFavoriteById({ ...favoriteById, [favorite.id!]: favorite });
    setEpisodeSourcesById({ ...episodeSourcesById, [favorite.id!]: episodeSources });
    setEpisodesById({ ...episodesById, [favorite.id!]: episodes });
    setEpisodeCountById({ ...episodeCountById, [favorite.id!]: episodes.length });
    episodeSources.forEach(source =>
      episodeSourceProvider.create(EpisodeSource.fromMap({ ...source, favoriteId: favorite.id }))
    );
    episodes.forEach(episode => episodeProvider.create(Episode.fromMap({ ...episode, favoriteId: favorite.id })));
    setFavoriting(false);
  };

  /**
   * 取消收藏
   */
  const onCancelFavorite = async () => {
    if (favorite) {
      setFavoriting(true);
      const id = favorite.id;
      setFavorite(null);
      favoriteList.splice(favoriteList.indexOf(favorite.id!), 1);
      setFavoriteList([...favoriteList]);
      delete favoriteById[favorite.id!];
      setFavoriteById({ ...favoriteById });
      favoriteProvider.deleteById(id!);
      episodeProvider.delete(`${EPISODE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [id!]);
      episodeSourceProvider.delete(`${EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID} = ?`, [id!]);
      setFavoriting(false);
    }
  };

  /**
   * 修改历史记录状态
   */
  const updateFavoriteHistoryStatus = async (hs: HistoryStatus) => {
    if (favorite) {
      const f = Favorite.fromMap({
        ...favorite.toMap(),
        ...hs,
        episodeUpdateFlag: 0,
        lastWatchTime: new Date().toISOString(),
      });
      await favoriteProvider.update(f);
      setFavoriteById({ ...favoriteById, [f.id!]: f });
    }
  };

  return (
    <>
      {streamUrl ? (
        <Box safeAreaTop>
          <ZStack>
            <VideoPlayer
              fullscreen={{
                enterFullscreen: async () => {
                  await setStatusBarHidden(true, 'none');
                  setInFullsreen(!inFullscreen);
                  lockAsync(OrientationLock.LANDSCAPE_RIGHT);
                },
                exitFullscreen: async () => {
                  await setStatusBarHidden(false, 'none');
                  setInFullsreen(!inFullscreen);
                  lockAsync(OrientationLock.DEFAULT);
                },
                inFullscreen,
              }}
              videoProps={{
                shouldPlay: true,
                ref: refVideo,
                resizeMode: ResizeMode.CONTAIN,
                source: {
                  uri: streamUrl,
                  overrideFileExtensionAndroid: 'm3u8',
                },
              }}
              style={{
                height: inFullscreen ? Dimensions.get('window').width : 200,
                width: inFullscreen ? Dimensions.get('window').height : Dimensions.get('window').width,
              }}
            />
            {!inFullscreen && (
              <IconButton
                borderRadius="full"
                className="text-xl"
                icon={<Icon className="text-white" as={<Ionicons name="chevron-back" />} />}
                onPress={() => {
                  navigation.goBack();
                }}
              />
            )}
          </ZStack>
          <Row>
            {favoriting ? (
              <Spinner color="pink.800" className="w-10" />
            ) : favorite == null ? (
              <IconButton
                className="text-xl"
                borderRadius="full"
                icon={<Icon className="text-pink-800" as={<MaterialIcons name="favorite-outline" />} />}
                onPress={onFavorite}
              />
            ) : (
              <IconButton
                className="text-xl"
                borderRadius="full"
                icon={<Icon className="text-pink-800" as={<MaterialIcons name="favorite" />} />}
                onPress={onCancelFavorite}
              />
            )}
            <IconButton
              className="text-xl"
              borderRadius="full"
              icon={<Icon className="text-pink-800" as={<MaterialCommunityIcons name="web" />} />}
              onPress={() => openBrowserAsync(episodes[historyStatus.currEpisode].playPageUrl)}
            />
            <Spacer />
            {historyStatus.currEpisode > 0 && (
              <IconButton
                className="text-xl"
                borderRadius="full"
                icon={<Icon className="text-pink-800" as={<MaterialIcons name="skip-previous" />} />}
                onPress={() => onEpisodeChange(historyStatus.currEpisode - 1)}
              />
            )}
            {historyStatus.currEpisode < episodes.length - 1 && (
              <IconButton
                className="text-xl"
                borderRadius="full"
                icon={<Icon className="text-pink-800" as={<MaterialIcons name="skip-next" />} />}
                onPress={() => onEpisodeChange(historyStatus.currEpisode + 1)}
              />
            )}
          </Row>
        </Box>
      ) : (
        <Box safeAreaTop>
          <Spinner size="lg" className="h-[200px] bg-black" />
          <Row className="h-10 items-center p-3" space={5}>
            <Skeleton size="5" rounded="full" startColor="pink.200" />
            <Skeleton size="5" rounded="full" startColor="pink.200" />
            <Spacer />
            <Skeleton size="5" rounded="full" startColor="pink.200" />
            <Skeleton size="5" rounded="full" startColor="pink.200" />
          </Row>
        </Box>
      )}
      <Box className="flex-1 mx-2 my-1 rounded-lg overflow-hidden border border-gray-200" safeAreaBottom>
        <VideoInfo {...videoInfo} />
        {episodes.length > 0 ? (
          <>
            <Row className="mt-2 px-2">
              <Spacer />
              <Menu
                trigger={triggerProps => {
                  return (
                    <Pressable {...triggerProps} className="flex-row items-center">
                      <Text noOfLines={1} className="text-gray-800 text-sm font-medium mr-2">
                        {episodeSources[historyStatus.currEpisodeSource].title}
                      </Text>
                      <Icon as={<MaterialIcons name="expand-more" />} />
                    </Pressable>
                  );
                }}>
                {episodeSources.map((source, index) => (
                  <Menu.Item
                    key={index}
                    onPress={async () => {
                      setStreamUrl(null);
                      setEpisodes([]);
                      setHistoryStatus({ ...historyStatus, currEpisodeSource: index });
                      const playPageUrl = await loadEpisodes(index);
                      loadStreamUrl(playPageUrl);
                    }}>
                    {source.title}
                  </Menu.Item>
                ))}
              </Menu>
            </Row>
            <ScrollView>
              <View className="flex flex-wrap flex-row">
                {episodes.map((episode, index) => (
                  <Center key={index} className="basis-1/3">
                    <Button
                      size="sm"
                      variant={index === historyStatus.currEpisode ? 'solid' : 'outline'}
                      className="w-5/6 mt-2"
                      onPress={() => onEpisodeChange(index)}>
                      <Text
                        noOfLines={1}
                        className={index === historyStatus.currEpisode ? 'text-white' : 'text-cyan-600'}>
                        {episode.title}
                      </Text>
                    </Button>
                  </Center>
                ))}
              </View>
            </ScrollView>
          </>
        ) : (
          <>
            <Row className="mt-2 px-2 mb-2">
              <Spacer />
              <Skeleton rounded="full" startColor="gray.400" className="w-20 h-5" />
            </Row>
            <Skeleton className="flex-1" startColor="cyan.100" />
          </>
        )}
      </Box>
    </>
  );
}
