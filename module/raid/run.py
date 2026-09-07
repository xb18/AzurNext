"""突袭任务运行器，管理突袭的进入、次数检测和停止条件。
支持 OCR 检测剩余次数和运行次数限制。
"""

from module.base.timer import Timer
from module.campaign.campaign_event import CampaignEvent
from module.exception import ScriptEnd, ScriptError
from module.logger import logger
from module.raid.assets import RAID_REWARDS
from module.raid.raid import Raid, raid_ocr
from module.ui.page import page_campaign_menu, page_raid, page_rpg_stage


class RaidRun(Raid, CampaignEvent):
    run_count: int
    run_limit: int

    def triggered_stop_condition(self, oil_check=False, pt_check=False, coin_check=False):
        """
        检查是否触发了停止条件，包括运行次数限制和父类条件。

        Returns:
            bool: 是否触发了停止条件。
        """
        # 运行次数限制
        if self.run_limit and self.config.StopCondition_RunCount <= 0:
            logger.hr('触发停止条件: 运行次数')
            self.config.StopCondition_RunCount = 0
            self.config.Scheduler_Enable = False
            return True

        return super().triggered_stop_condition(oil_check=oil_check, pt_check=pt_check, coin_check=coin_check)

    def get_remain(self, mode, skip_first_screenshot=True):
        """
        获取指定难度的剩余挑战次数。

        Args:
            mode (str): 难度模式，easy、normal、hard 或 ex。
            skip_first_screenshot (bool): 是否跳过首次截图。

        Returns:
            int: 剩余挑战次数。
        """
        confirm_timer = Timer(0.3, count=0)
        prev = 30
        while 1:
            if skip_first_screenshot:
                skip_first_screenshot = False
            else:
                self.device.screenshot()

            ocr = raid_ocr(raid=self.config.Campaign_Event, mode=mode)
            result = ocr.ocr(self.device.image)
            if mode == 'ex':
                remain = result
            else:
                remain, _, _ = result
            logger.attr(f'{mode.capitalize()} 剩余次数', remain)

            if self.appear_then_click(RAID_REWARDS, offset=(30, 30), interval=3):
                confirm_timer.reset()
                continue

            # 结束条件：OCR 结果稳定则认为读取完成
            if remain == prev:
                if confirm_timer.reached():
                    break
            else:
                confirm_timer.reset()

            prev = remain

        return remain

    def run_sequence(self, name):
        """
        按顺序执行：简单15次 -> 普通15次 -> 之后一直执行困难。

        检查各难度剩余次数，若为 0 则自动跳过进入下一难度，
        最后在困难难度持续执行，直到触发停止条件。
        """
        if self.is_raid_rpg():
            logger.warning('[突袭-运行] RPG突袭不支持按顺序多难度，直接执行困难模式')
            return self._run_loop(name=name, mode='hard')

        logger.hr('共斗按顺序执行：简单15次 -> 普通15次 -> 之后困难', level=1)

        # 1. 简单阶段（最多 15 次，剩余 0 次则跳过）
        logger.hr('简单阶段 (Easy 15次)', level=2)
        while 1:
            if not self.is_raid_rpg():
                self.ui_ensure(page_raid)
            remain = self.get_remain(mode='easy')
            if remain <= 0:
                logger.info('简单难度剩余次数为 0，进入下一阶段')
                break
            stopped = self._run_loop(name=name, mode='easy', total=1)
            if stopped or self.triggered_stop_condition():
                return
            if self.config.task_switched():
                self.config.task_stop()

        # 2. 普通阶段（最多 15 次，剩余 0 次则跳过）
        logger.hr('普通阶段 (Normal 15次)', level=2)
        while 1:
            if not self.is_raid_rpg():
                self.ui_ensure(page_raid)
            remain = self.get_remain(mode='normal')
            if remain <= 0:
                logger.info('普通难度剩余次数为 0，进入下一阶段')
                break
            stopped = self._run_loop(name=name, mode='normal', total=1)
            if stopped or self.triggered_stop_condition():
                return
            if self.config.task_switched():
                self.config.task_stop()

        # 3. 困难阶段（一直执行直至触发停止条件）
        logger.hr('困难阶段 (Hard 持续运行)', level=2)
        self._run_loop(name=name, mode='hard', total=0)

    def _run_loop(self, name, mode, total=0):
        """
        执行突袭循环。

        Args:
            name (str): 突袭活动名称。
            mode (str): 突袭难度模式。
            total (int): 运行次数限制，0 表示不限制。

        Returns:
            bool: 是否因停止条件或异常而停止。
        """
        count_in_this_loop = 0
        while 1:
            # 达到指定运行次数则结束
            if total and count_in_this_loop >= total:
                return False
            if self.event_time_limit_triggered():
                self.config.task_stop()

            # 日志输出
            logger.hr(f'{name}_{mode}', level=2)
            if self.config.StopCondition_RunCount > 0:
                logger.info(f'剩余次数: {self.config.StopCondition_RunCount}')
            else:
                logger.info(f'计数: {self.run_count}')

            # UI 切换：没有油量图标时先进入战役菜单检查停止条件
            if not self._raid_has_oil_icon:
                self.ui_ensure(page_campaign_menu)
                if self.triggered_stop_condition(oil_check=True, coin_check=True):
                    return True

            # 确保进入正确的 UI 页面
            self.device.stuck_record_clear()
            self.device.click_record_clear()
            if not self.is_raid_rpg():
                self.ui_ensure(page_raid)
            else:
                self.ui_ensure(page_rpg_stage)
                self.raid_rpg_swipe()
            self.disable_event_on_raid()

            # EX 模式：检查是否有足够的突袭门票
            if mode == 'ex' and not self.is_raid_rpg():
                if not self.get_remain(mode):
                    logger.info('[突袭-运行] 触发停止条件: EX模式突袭门票为零')
                    if self.config.task.command == 'Raid':
                        with self.config.multi_set():
                            self.config.StopCondition_RunCount = 0
                            self.config.Scheduler_Enable = False
                    return True

            # 执行突袭战斗
            self.device.stuck_record_clear()
            self.device.click_record_clear()
            try:
                self.raid_execute_once(mode=mode, raid=name)
            except ScriptEnd as e:
                logger.hr('脚本结束')
                logger.info(str(e))
                return True

            # 战斗结束后更新计数
            self.run_count += 1
            count_in_this_loop += 1
            if self.config.StopCondition_RunCount:
                self.config.StopCondition_RunCount -= 1
            # 检查停止条件
            if self.triggered_stop_condition():
                return True
            # 检查调度器是否切换了任务
            if self.config.task_switched():
                self.config.task_stop()

    def run(self, name='', mode='', total=0):
        """
        运行突袭任务主循环，处理战斗执行、停止条件和调度器切换。

        Args:
            name (str): 突袭活动名称，如 'raid_20200624'。
            mode (str): 突袭难度，如 'hard'、'normal'、'easy' 或 'easy_15_normal_15_hard'。
            total (int): 总运行次数，0 表示不限制。
        """
        name = name if name else self.config.Campaign_Event
        mode = mode if mode else self.config.Raid_Mode
        if not name or not mode:
            raise ScriptError(f'RaidRun arguments unfilled. name={name}, mode={mode}')

        self.run_count = 0
        self.run_limit = self.config.StopCondition_RunCount

        if mode == 'easy_15_normal_15_hard':
            return self.run_sequence(name=name)

        return self._run_loop(name=name, mode=mode, total=total)
